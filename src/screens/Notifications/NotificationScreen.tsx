import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ScreenWrapper from "../../components/ScreenWrapper";
import EmptyState from "../../components/emptyState";
import { NotificationRepo } from "../../repositories/notification";
import { useHelper } from "../../utils/helper";
import { commonStyles } from "../../styles/commonstyles";
import { Column } from "../../tools";
import { theme } from "../../infrastructure/theme";

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const PAGE_SIZE = 20;

const NotificationScreen = () => {
  const { loggedInUser, formatDate, themeColor, handleNotificationNavigation } =
    useHelper();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // initial or refresh loading
  const [loadingMore, setLoadingMore] = useState(false); // pagination loading
  const [refreshing, setRefreshing] = useState(false);
  const userId = loggedInUser?.userId;

  // ------------------ Fetch Notifications ------------------ //
  const fetchNotifications = useCallback(
    async (pageNumber = 1, refresh = false) => {
      if (!userId) return;

      if (refresh) setLoading(true);
      else setLoadingMore(true);

      try {
        const response: any = await NotificationRepo.getNotifications({
          userId,
          page: pageNumber,
          pageSize: PAGE_SIZE,
        });

        const fetchedNotifications = response.notifications || [];

        setNotifications((prev) =>
          refresh ? fetchedNotifications : [...prev, ...fetchedNotifications]
        );

        setTotalPages(response.totalPages || 1);
        setPage(pageNumber);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        if (refresh) setLoading(false);
        else setLoadingMore(false);
        if (refresh) setRefreshing(false);
      }
    },
    [userId]
  );

  // ------------------ Refetch on screen focus ------------------ //
  useFocusEffect(
    useCallback(() => {
      if (notifications.length === 0) {
        fetchNotifications(1, true);
      }
    }, [fetchNotifications, notifications.length])
  );

  // ------------------ Pull to refresh ------------------ //
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1, true);
  };

  // ------------------ Load more pagination ------------------ //
  const loadMore = () => {
    if (page < totalPages && !loadingMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  // ------------------ Mark notification as read ------------------ //
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );

    NotificationRepo.markNotificationsAsRead({
      userId: userId ?? "",
      notificationIds: [notificationId],
    }).catch((err) => console.error("Error marking as read:", err));
  };

  // ------------------ Handle notification press ------------------ //
  const handleNotification = (notificationId: string, notData?: any) => {
    markAsRead(notificationId);
    if (notData) handleNotificationNavigation(notData);
  };

  // ------------------ Render notification item ------------------ //
  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        commonStyles.cardContainer,
        { backgroundColor: item.isRead ? "" : `${themeColor.light}30` },
      ]}
      onPress={() => handleNotification(item._id, item?.data)}
    >
      <Column gap={3} style={commonStyles.fullFlex}>
        <Text style={commonStyles.basicText}>{item.title}</Text>
        <Text style={commonStyles.tinyText}>{item.body}</Text>
        <Text style={commonStyles.tTinyText}>{formatDate(item.createdAt)}</Text>
      </Column>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper title="Notifications" showBackbutton>
      {notifications.length === 0 && !loading ? (
        <EmptyState text="No notifications!" loading={loading} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: theme.spacing.md }}>
                <ActivityIndicator
                  size="small"
                  color={themeColor.dark ?? theme.colors.primary}
                />
              </View>
            ) : null
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default NotificationScreen;
