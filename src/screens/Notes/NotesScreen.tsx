import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNotesListViewModel } from "./notesViewModal";
import FloatingAdd from "../../components/FloatingAdd";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { ROUTES } from "../../enums/routes";
import { Column, dimensions, isDarkMode, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useHelper } from "../../utils/helper";
import { Note } from "../../repositories/notes";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../../components/customInput";
import Avatar from "../../components/avatar";
import CardWrapper from "../../components/cardWrapper";
import { useUtilStore } from "../../store/utils";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import Swiper from "react-native-deck-swiper";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedListItem from "../../components/animatedListItem";
import AlertModal from "../../components/AlertModal";

export default function NotesScreen() {
  const { formatDate, themeColor, loggedInUser } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = cardStyle(theme, themeColor);
  const { fetchingNotes } = useUtilStore();
  const {
    notes,
    initialLoading,
    loadingMore,
    error,
    fetchNotes,
    handlePinUnpinNote,
    showAlert,
    setShowAlert,
    searchNotes,
    loadMoreNotes,
    page,
    totalPages,
    showSearch,
    toggleSearch,
    noteImages,
    toggleView,
    cardView,
    pageSize,
  } = useNotesListViewModel();
  const navigation: any = useNavigation();

  useEffect(() => {
    fetchNotes(1, true);
  }, [fetchingNotes]);

  const renderItem = ({
    item,
    swiper,
    index,
  }: {
    item: Note;
    swiper?: boolean;
    index: number;
  }) => {
    const Container = swiper ? Pressable : TouchableOpacity;
    const animate = index < pageSize;
    return (
      <AnimatedListItem index={index} animate={animate}>
        <Container
          onLongPress={() => setShowAlert(item._id)}
          onPress={() =>
            navigation.navigate(ROUTES.VIEW_NOTE, { noteId: item._id })
          }
          style={[
            {
              flex: 1,
              marginLeft: index % 2 ? 4 : 0,
              marginRight: index % 2 ? 0 : 4,
            },
            swiper && {
              paddingLeft: index % 2 ? 0 : 4,
              paddingRight: index % 2 ? 4 : 0,
            },
          ]}
        >
          <CardWrapper
            // image={item?.image}
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
              gap={7}
              style={[
                commonStyles.fullFlex,
                {
                  padding: 12,
                },
              ]}
              justifyContent="space-between"
            >
              <Column gap={6}>
                <Row justifyContent="space-between" gap={8} alignItems="center">
                  {item?.title && (
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
                  )}
                  {item.pinned && (
                    <Ionicons
                      size={swiper ? 20 : 16}
                      color={swiper ? themeColor.light : themeColor.dark}
                      name="pricetag"
                    />
                  )}
                </Row>
                <Text
                  numberOfLines={swiper ? 27 : 3}
                  style={[
                    commonStyles.tinyText,
                    swiper && commonStyles.basicText,
                    swiper && commonStyles.whiteText,
                  ]}
                >
                  {item.note}
                </Text>
              </Column>
              <Column gap={8}>
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
                        ? item.createdByDetails.name.split(" ")[0]
                        : item.createdBy
                    }
                    image={item?.createdByDetails?.image}
                    withName
                    size={swiper ? 20 : undefined}
                  />
                </Row>
                <Row alignItems="center" justifyContent="space-between" gap={4}>
                  <Row alignItems="center" gap={4}>
                    <Ionicons
                      name="time-outline"
                      size={swiper ? 16 : 12}
                      color={
                        swiper ? theme.colors.white : theme.colors.textLight
                      }
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
            </Column>
          </CardWrapper>
        </Container>
        <AlertModal
          isVisible={showAlert === item._id}
          loading={initialLoading}
          onClose={() => setShowAlert(undefined)}
          onConfirm={() => handlePinUnpinNote(item._id, item.pinned ?? false)}
          title={`${!item.pinned ? "Pin" : "Unpin"} Note?`}
          subTitle={`${!item.pinned ? "Pin" : "Unpin"} this note?`}
        />
      </AnimatedListItem>
    );
  };

  const renderFooter = () =>
    loadingMore && page < totalPages ? (
      <ScreenLoader type={LoaderTypes.NotesScreen} count={4} />
    ) : (
      <Spacer size={100} />
    );

  return (
    <ScreenWrapper
      title="Notes"
      image={noteImages}
      // onSearchPress={toggleSearch}
      noPadding
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
        {notes?.length === 0 || initialLoading ? (
          <EmptyState
            text="No notes found"
            button={() => fetchNotes(1, true)}
            loading={initialLoading}
            error={!!error?.length}
            type={LoaderTypes.NotesScreen}
          />
        ) : (
          <>
            {showSearch && (
              <CustomInput
                placeholder="Search here..."
                onChangeText={searchNotes}
              />
            )}
            {!cardView ? (
              <FlatList
                data={notes}
                keyExtractor={(item) => item._id!}
                renderItem={renderItem}
                refreshControl={
                  <RefreshControl
                    refreshing={initialLoading}
                    onRefresh={() => fetchNotes(1, true)}
                    colors={[themeColor.dark]}
                  />
                }
                onEndReached={loadMoreNotes}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
                numColumns={2}
              />
            ) : (
              <View style={styles.container}>
                <Swiper
                  cards={notes}
                  swipeAnimationDuration={600}
                  stackSeparation={20}
                  cardIndex={0}
                  stackSize={3}
                  cardVerticalMargin={0}
                  cardHorizontalMargin={0}
                  backgroundColor="transparent"
                  onSwiped={(index) => {
                    const nearEnd = index >= notes.length - 3;
                    if (nearEnd && page < totalPages && !loadingMore) {
                      loadMoreNotes();
                    }
                  }}
                  onSwipedAll={() => {
                    if (page < totalPages) {
                      loadMoreNotes();
                    } else {
                      fetchNotes(1, true);
                    }
                  }}
                  renderCard={(note, index) => {
                    if (!note) return null;
                    return (
                      <ImageBackground
                        source={{
                          uri: note.image?.trim() ? note.image : "",
                        }}
                        style={styles.card}
                      >
                        <LinearGradient
                          colors={["#00000099", "#00000099"]}
                          style={styles.overlay}
                        />
                        {renderItem({ item: note, swiper: true, index })}
                      </ImageBackground>
                    );
                  }}
                />
              </View>
            )}
          </>
        )}
      </View>
      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_NOTE)} />
    </ScreenWrapper>
  );
}

export const cardStyle = (theme: any, themeColor: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      backgroundColor: isDarkMode ? themeColor.dark : themeColor.light,
      borderRadius: 20,
      width: dimensions.width - 24,
      elevation: 10,
      height: dimensions.height - 220,
      overflow: "hidden",
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  });
};
