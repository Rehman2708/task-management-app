import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import EmptyState from "../../components/emptyState";
import { NotificationRepo } from "../../repositories/notification";
import { useHelper } from "../../utils/helper";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Row, Spacer } from "../../tools";
import { useTheme } from "../../infrastructure/theme";
import { Images } from "../../../assets/images/images";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import Avatar from "../../components/avatar";

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
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
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
  useEffect(
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
  const renderItem = ({ item }: { item: NotificationItem }) => {
    const bgColor = item.isRead ? "transparent" : `${themeColor.light}30`;
    return (
      <TouchableOpacity
        style={[
          // commonStyles.cardContainer,
          {
            backgroundColor: bgColor,
            borderColor: theme.colors.border,
            borderBottomWidth: 1,
            paddingVertical: 16,
            paddingHorizontal: 16,
          },
        ]}
        onPress={() => handleNotification(item._id, item?.data)}
      >
        <Row alignItems="center">
          {item?.data?.image && (
            <Avatar disabled image={item.data.image} name="NA" size={50} />
          )}
          <Spacer size={12} position="right" />
          <Column gap={3} style={commonStyles.fullFlex}>
            <Text style={[commonStyles.basicText]}>{item.title}</Text>
            <Text style={[commonStyles.tinyText]}>{item.body}</Text>
            <Text style={commonStyles.tTinyText}>
              {formatDate(item.createdAt)}
            </Text>
          </Column>
        </Row>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper
      noPadding
      title="Notifications"
      showBackbutton
      hideNotificationButton
    >
      {notifications.length === 0 || loading ? (
        <EmptyState
          text="No notifications!"
          loading={loading}
          image={Images.noNotification}
          type={LoaderTypes.NotificationScreen}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={notifications}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? (
              <ScreenLoader count={4} type={LoaderTypes.NotificationScreen} />
            ) : null
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default NotificationScreen;
