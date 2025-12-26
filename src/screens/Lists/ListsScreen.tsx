import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { useHelper } from "../../utils/helper";
import { useUtilStore } from "../../store/utils";
import ScreenWrapper from "../../components/ScreenWrapper";
import FloatingAdd from "../../components/FloatingAdd";
import EmptyState from "../../components/emptyState";
import { ROUTES } from "../../enums/routes";
import { Column, isDarkMode, Row, Spacer } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import CardWrapper from "../../components/cardWrapper";
import CustomInput from "../../components/customInput";
import Avatar from "../../components/avatar";
import { List } from "../../repositories/lists";
import { useListsViewModel } from "./listsViewModel";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-deck-swiper";
import { cardStyle } from "../Notes/NotesScreen";
import AnimatedListItem from "../../components/animatedListItem";
import AlertModal from "../../components/AlertModal";

export default function ListsScreen() {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { formatDate, themeColor } = useHelper();
  const styles = cardStyle(theme, themeColor);
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
    handlePinUnpinList,
    setShowAlert,
    showAlert,
    toggleSearch,
    showSearch,
    searchLists,
    listImages,
    toggleView,
    cardView,
    pageSize,
  } = useListsViewModel();

  useEffect(() => {
    fetchLists(1, true);
  }, [fetchingLists]);

  const renderItem = ({
    item,
    swiper,
    index,
  }: {
    item: List;
    swiper?: boolean;
    index: number;
  }) => {
    const completedCount = item.items.filter((i) => i.completed).length;
    const totalCount = item.items.length;
    const Container = swiper ? Pressable : TouchableOpacity;
    const animate = index < pageSize;
    return (
      <AnimatedListItem index={index} animate={animate}>
        <Container
          onLongPress={() => setShowAlert(item._id)}
          onPress={() =>
            navigation.navigate(ROUTES.VIEW_LIST, { listId: item._id })
          }
          style={{
            flex: 1,
            paddingHorizontal: swiper ? 4 : 0,
          }}
        >
          <CardWrapper
            style={[
              commonStyles.cardContainer,
              commonStyles.fullFlex,
              { padding: 0 },
            ]}
          >
            {item.image && !swiper && (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: "100%",
                  height: swiper ? 200 : 80,
                  backgroundColor: theme.colors.loaderBg,
                }}
              />
            )}
            <Column
              gap={6}
              style={[commonStyles.fullFlex, { padding: 12 }]}
              justifyContent="space-between"
            >
              <Column gap={6}>
                <Row justifyContent="space-between" alignItems="center">
                  <Text
                    numberOfLines={1}
                    style={[
                      commonStyles.basicText,
                      swiper && commonStyles.titleText,
                      swiper && commonStyles.whiteText,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.pinned && (
                    <Ionicons
                      size={swiper ? 20 : 16}
                      color={swiper ? themeColor.light : themeColor.dark}
                      name="pricetag"
                    />
                  )}
                </Row>
                <Text
                  numberOfLines={swiper ? 5 : 2}
                  style={[
                    commonStyles.tinyText,
                    swiper && commonStyles.basicText,
                    swiper && commonStyles.whiteText,
                  ]}
                >
                  {item?.description?.length > 0
                    ? item.description
                    : "📝 No Description"}
                </Text>
                {swiper &&
                  item.items.map((item, index) => (
                    <Row key={index}>
                      <Text
                        style={[
                          commonStyles.smallText,
                          swiper && commonStyles.whiteText,
                        ]}
                      >
                        {index + 1}.{" "}
                      </Text>
                      <Text
                        style={[
                          commonStyles.smallText,
                          commonStyles.fullFlex,
                          swiper && commonStyles.whiteText,
                          item.completed && {
                            textDecorationLine: "line-through",
                            color: theme.colors.success,
                          },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </Row>
                  ))}
                <Row alignItems="center" justifyContent="space-between" gap={4}>
                  {totalCount > 0 ? (
                    <Row alignItems="center" gap={4}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={swiper ? 16 : 12}
                        color={theme.colors.success}
                      />
                      <Text
                        numberOfLines={2}
                        style={[
                          commonStyles.tinyText,
                          swiper && commonStyles.smallText,
                          swiper && commonStyles.whiteText,
                        ]}
                      >
                        {completedCount}/{totalCount} items completed
                      </Text>
                    </Row>
                  ) : (
                    <Text
                      numberOfLines={2}
                      style={[
                        commonStyles.tinyText,
                        swiper && commonStyles.smallText,
                        swiper && commonStyles.whiteText,
                      ]}
                    >
                      No items added
                    </Text>
                  )}
                  <Row alignItems="center" gap={6}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={swiper ? 16 : 12}
                      color={
                        !swiper ? theme.colors.textLight : theme.colors.white
                      }
                    />
                    <Text
                      style={[
                        commonStyles.tTinyText,
                        swiper && commonStyles.tinyText,
                        swiper && commonStyles.whiteText,
                      ]}
                    >
                      {item.totalComments ?? 0}
                    </Text>
                  </Row>
                </Row>
              </Column>

              <Row justifyContent="space-between" alignItems="center" gap={6}>
                <Row alignItems="center">
                  <Text
                    style={[
                      commonStyles.tTinyText,
                      swiper && commonStyles.tinyText,
                      swiper && commonStyles.whiteText,
                    ]}
                  >
                    Creator:{" "}
                  </Text>
                  <Avatar
                    name={
                      item?.createdByDetails
                        ? item.createdByDetails.name
                        : item.createdBy
                    }
                    image={item?.createdByDetails?.image}
                    withName
                    size={swiper ? 20 : undefined}
                  />
                </Row>
                <Row alignItems="center" gap={4}>
                  <Ionicons
                    name="time-outline"
                    size={swiper ? 16 : 12}
                    color={swiper ? theme.colors.white : theme.colors.textLight}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      commonStyles.tTinyText,
                      swiper && commonStyles.tinyText,
                      swiper && commonStyles.whiteText,
                    ]}
                  >
                    {formatDate(item?.createdAt)}
                  </Text>
                </Row>
              </Row>
            </Column>
          </CardWrapper>
        </Container>
        <AlertModal
          isVisible={item._id === showAlert}
          loading={initialLoading}
          onClose={() => setShowAlert(undefined)}
          onConfirm={() => handlePinUnpinList(item._id, item.pinned ?? false)}
          title={`${!item.pinned ? "📌 Pin" : "📌 Unpin"} List?`}
          subTitle={`${!item.pinned ? "Pin" : "Unpin"} this list?`}
        />
      </AnimatedListItem>
    );
  };

  const renderFooter = () =>
    loadingMore && page < totalPages ? (
      <ScreenLoader type={LoaderTypes.ListScreen} count={4} />
    ) : (
      <Spacer size={100} />
    );

  return (
    <ScreenWrapper
      title="📋 Lists"
      image={listImages}
      noPadding
      // onSearchPress={toggleSearch}
      rightIcon={
        <TouchableOpacity onPress={toggleView}>
          <Ionicons
            name={cardView ? "grid-outline" : "tablet-portrait-outline"}
            size={26}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      }
    >
      <View style={commonStyles.screenWrapper}>
        {lists?.length === 0 || initialLoading ? (
          <EmptyState
            text="📋 No lists found"
            button={() => fetchLists(1, true)}
            loading={initialLoading}
            error={!!error?.length}
            type={LoaderTypes.ListScreen}
          />
        ) : (
          <>
            {showSearch && (
              <CustomInput
                placeholder="🔍 Search lists..."
                onChangeText={searchLists}
              />
            )}
            {!cardView ? (
              <FlatList
                data={lists}
                keyExtractor={(item) => item._id!}
                renderItem={renderItem}
                refreshControl={
                  <RefreshControl
                    refreshing={initialLoading}
                    onRefresh={() => fetchLists(1, true)}
                    colors={[themeColor.dark]}
                  />
                }
                onEndReached={loadMoreLists}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
                // numColumns={2}
              />
            ) : (
              <>
                <View style={styles.container}>
                  <Swiper
                    cards={lists}
                    keyExtractor={(item) => item._id!}
                    swipeAnimationDuration={600}
                    stackSeparation={20}
                    cardIndex={0}
                    stackSize={3}
                    cardVerticalMargin={0}
                    cardHorizontalMargin={0}
                    backgroundColor="transparent"
                    onSwiped={(index) => {
                      const nearEnd = index >= lists.length - 3;
                      if (nearEnd && page < totalPages && !loadingMore) {
                        loadMoreLists();
                      }
                    }}
                    onSwipedAll={() => {
                      if (page < totalPages) {
                        loadMoreLists();
                      } else {
                        fetchLists(1, true);
                      }
                    }}
                    renderCard={(list, index) => {
                      if (!list) return null;
                      return (
                        <ImageBackground
                          source={{
                            uri: list.image?.trim() ? list.image : "",
                          }}
                          style={styles.card}
                        >
                          <LinearGradient
                            colors={["#00000099", "#00000099"]}
                            style={styles.overlay}
                          />
                          {renderItem({ item: list, swiper: true, index })}
                        </ImageBackground>
                      );
                    }}
                  />
                </View>
              </>
            )}
          </>
        )}
      </View>

      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_LIST)} />
    </ScreenWrapper>
  );
}
