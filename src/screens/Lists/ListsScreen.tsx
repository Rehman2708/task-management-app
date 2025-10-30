import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useListsViewModel } from "./listsViewModel";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { useHelper } from "../../utils/helper";
import { useUtilStore } from "../../store/utils";
import ScreenWrapper from "../../components/ScreenWrapper";
import FloatingAdd from "../../components/FloatingAdd";
import EmptyState from "../../components/emptyState";
import { ROUTES } from "../../enums/routes";
import { Column, Row } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import CardWrapper from "../../components/cardWrapper";
import CustomInput from "../../components/customInput";
import Avatar from "../../components/avatar";
import { List } from "../../repositories/lists";

export default function ListsScreen() {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { formatDate, themeColor } = useHelper();
  const { fetchingLists } = useUtilStore();
  const navigation: any = useNavigation();

  const {
    lists,
    initialLoading,
    loadingMore,
    error,
    fetchLists,
    loadMoreLists,
    page,
    totalPages,
    pinUnpinList,
    toggleSearch,
    showSearch,
    searchLists,
  } = useListsViewModel();

  useEffect(() => {
    fetchLists(1, true);
  }, [fetchingLists]);

  const renderItem = ({ item }: { item: List }) => {
    const completedCount = item.items.filter((i) => i.completed).length;
    const totalCount = item.items.length;

    return (
      <TouchableOpacity
        onLongPress={() => pinUnpinList(item._id, item.pinned ?? false)}
        onPress={() =>
          navigation.navigate(ROUTES.VIEW_LIST, { listId: item._id })
        }
        style={{ flex: 1, marginHorizontal: 4 }}
      >
        <CardWrapper
          style={[
            commonStyles.cardContainer,
            commonStyles.fullFlex,
            { borderRightWidth: 1, borderBottomWidth: 1, padding: 0 },
          ]}
        >
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: 80 }}
            />
          )}
          <Column
            gap={6}
            style={[commonStyles.fullFlex, { padding: 12 }]}
            justifyContent="space-between"
          >
            <Column gap={6}>
              <Row justifyContent="space-between" alignItems="center">
                <Text numberOfLines={1} style={commonStyles.basicText}>
                  {item.title}
                </Text>
                {item.pinned && (
                  <Ionicons size={16} color={themeColor.dark} name="pricetag" />
                )}
              </Row>
              <Text numberOfLines={2} style={commonStyles.tinyText}>
                {item.description}
              </Text>
              <Text numberOfLines={2} style={commonStyles.tinyText}>
                {completedCount}/{totalCount} items completed
              </Text>
            </Column>

            <Row justifyContent="space-between" alignItems="center" gap={6}>
              <Row alignItems="center">
                <Text style={commonStyles.tTinyText}>Creator: </Text>
                <Avatar
                  name={
                    item?.createdByDetails
                      ? item.createdByDetails.name.split(" ")[0]
                      : item.createdBy
                  }
                  image={item?.createdByDetails?.image}
                  withName
                />
              </Row>
              <Text numberOfLines={1} style={commonStyles.tTinyText}>
                {formatDate(item?.createdAt)}
              </Text>
            </Row>
          </Column>
        </CardWrapper>
      </TouchableOpacity>
    );
  };

  const renderFooter = () =>
    loadingMore && page < totalPages ? (
      <View style={{ paddingVertical: theme.spacing.md }}>
        <ActivityIndicator
          size="small"
          color={themeColor.dark ?? theme.colors.primary}
        />
      </View>
    ) : null;

  return (
    <ScreenWrapper title="Lists" onSearchPress={toggleSearch}>
      <View style={commonStyles.screenWrapper}>
        {lists?.length > 0 ? (
          <>
            {showSearch && (
              <CustomInput
                placeholder="Search lists..."
                onChangeText={searchLists}
              />
            )}
            <FlatList
              data={lists}
              keyExtractor={(item) => item._id!}
              renderItem={renderItem}
              refreshing={initialLoading}
              onRefresh={() => fetchLists(1, true)}
              onEndReached={loadMoreLists}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
              showsVerticalScrollIndicator={false}
              // numColumns={2}
            />
          </>
        ) : (
          <EmptyState
            text="No lists found"
            button={() => fetchLists(1, true)}
            loading={initialLoading}
            error={!!error?.length}
          />
        )}
      </View>

      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_LIST)} />
    </ScreenWrapper>
  );
}
