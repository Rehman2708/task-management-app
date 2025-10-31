import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNotesListViewModel } from "./notesViewModal";
import FloatingAdd from "../../components/FloatingAdd";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { ROUTES } from "../../enums/routes";
import { Column, Row } from "../../tools";
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
import { LoaderTypes } from "../../components/screenLoader";

export default function NotesScreen() {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { formatDate, themeColor } = useHelper();
  const { fetchingNotes } = useUtilStore();
  const {
    notes,
    initialLoading,
    loadingMore,
    error,
    fetchNotes,
    pinUnpinNote,
    searchNotes,
    loadMoreNotes,
    page,
    totalPages,
    showSearch,
    toggleSearch,
  } = useNotesListViewModel();

  const navigation: any = useNavigation();

  useEffect(() => {
    fetchNotes(1, true);
  }, [fetchingNotes]);

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onLongPress={() => pinUnpinNote(item._id, item.pinned ?? false)}
      onPress={() =>
        navigation.navigate(ROUTES.VIEW_NOTE, { noteId: item._id })
      }
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      <CardWrapper
        // image={item?.image}
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
                <Text numberOfLines={1} style={commonStyles.basicText}>
                  {item.title}
                </Text>
              )}
              {item.pinned && (
                <Ionicons size={16} color={themeColor.dark} name="pricetag" />
              )}
            </Row>
            <Text numberOfLines={3} style={commonStyles.tinyText}>
              {item.note}
            </Text>
          </Column>
          <Column gap={6}>
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
            <Row alignItems="center" gap={4}>
              <Ionicons
                name="time-outline"
                size={12}
                color={theme.colors.textLight}
              />
              <Text numberOfLines={1} style={commonStyles.tTinyText}>
                {formatDate(item?.createdAt)}
              </Text>
            </Row>
          </Column>
        </Column>
      </CardWrapper>
    </TouchableOpacity>
  );

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
    <ScreenWrapper title="Notes" onSearchPress={toggleSearch}>
      <View style={commonStyles.screenWrapper}>
        {notes?.length > 0 ? (
          <>
            {showSearch && (
              <CustomInput
                placeholder="Search here..."
                onChangeText={searchNotes}
              />
            )}
            <FlatList
              data={notes}
              keyExtractor={(item) => item._id!}
              renderItem={renderItem}
              refreshing={initialLoading}
              onRefresh={() => fetchNotes(1, true)}
              onEndReached={loadMoreNotes}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
              showsVerticalScrollIndicator={false}
              numColumns={2}
            />
          </>
        ) : (
          <EmptyState
            text="No notes found"
            button={() => fetchNotes(1, true)}
            loading={initialLoading}
            error={!!error?.length}
            type={LoaderTypes.NotesScreen}
          />
        )}
      </View>
      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_NOTE)} />
    </ScreenWrapper>
  );
}
