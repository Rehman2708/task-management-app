import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Pressable,
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
import { Column, Row, Spacer } from "../../tools";
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
    pinUnpinList,
    toggleSearch,
    showSearch,
    searchLists,
    listImages,
    toggleView,
    cardView,
  } = useListsViewModel();

  useEffect(() => {
    fetchLists(1, true);
  }, [fetchingLists]);

  const renderItem = ({ item, swiper }: { item: List; swiper?: boolean }) => {
    const completedCount = item.items.filter((i) => i.completed).length;
    const totalCount = item.items.length;
    const Container = swiper ? Pressable : TouchableOpacity;
    return (
      <Container
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
                ]}
              >
                {item.description}
              </Text>
              {swiper &&
                item.items.map((item, index) => (
                  <Row>
                    <Text style={commonStyles.smallText}>{index}. </Text>
                    <Text
                      style={[
                        commonStyles.smallText,
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
                  ]}
                >
                  {completedCount}/{totalCount} items completed
                </Text>
              </Row>
            </Column>

            <Row justifyContent="space-between" alignItems="center" gap={6}>
              <Row alignItems="center">
                <Text
                  style={[
                    commonStyles.tTinyText,
                    swiper && commonStyles.tinyText,
                  ]}
                >
                  Creator:{" "}
                </Text>
                <Avatar
                  name={
                    item?.createdByDetails
                      ? item.createdByDetails.name.split(" ")[0]
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
                  color={theme.colors.textLight}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    commonStyles.tTinyText,
                    swiper && commonStyles.tinyText,
                  ]}
                >
                  {formatDate(item?.createdAt)}
                </Text>
              </Row>
            </Row>
          </Column>
        </CardWrapper>
      </Container>
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
      title="Lists"
      image={listImages}
      // onSearchPress={toggleSearch}
      rightIcon={
        <TouchableOpacity onPress={toggleView}>
          <Ionicons
            name={cardView ? "grid-outline" : "tablet-portrait-outline"}
            size={30}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      }
    >
      <View style={commonStyles.screenWrapper}>
        {lists?.length === 0 || initialLoading ? (
          <EmptyState
            text="No lists found"
            button={() => fetchLists(1, true)}
            loading={initialLoading}
            error={!!error?.length}
            type={LoaderTypes.ListScreen}
          />
        ) : (
          <>
            {showSearch && (
              <CustomInput
                placeholder="Search lists..."
                onChangeText={searchLists}
              />
            )}
            {!cardView ? (
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
                    renderCard={(list) => {
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
                          {renderItem({ item: list, swiper: true })}
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
