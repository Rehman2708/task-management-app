import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useNotesListViewModel } from "./notesViewModal";
import FloatingAdd from "../../components/FloatingAdd";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, isAndroid, isDarkMode, Row } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useHelper } from "../../utils/helper";
import { Note } from "../../repositories/notes";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../../components/customInput";
import Avatar from "../../components/avatar";
import { BlurView } from "expo-blur";
export default function NotesScreen() {
  const { formatDate, themeColor } = useHelper();

  const { notes, loading, error, fetchNotes, pinUnpinNote, searchNotes } =
    useNotesListViewModel();
  const navigation: any = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [])
  );
  const MemoBlur = React.memo(() => (
    <BlurView
      intensity={isAndroid ? 700 : 40}
      tint={isDarkMode ? "dark" : "light"}
      style={commonStyles.blurView}
    />
  ));

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onLongPress={() => pinUnpinNote(item._id, item.pinned ?? false)}
      onPress={() => navigation.navigate(ROUTES.VIEW_NOTE, { note: item })}
      style={{ flex: 1, marginHorizontal: 4 }}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item?.image }}
        style={[
          commonStyles.cardContainer,
          commonStyles.fullFlex,
          {
            borderRightWidth: 1,
            borderBottomWidth: 1,
            position: "relative",
            backgroundColor: "#000000",
          },
        ]}
      >
        {item?.image && <MemoBlur />}
        <Column
          gap={6}
          style={[commonStyles.fullFlex]}
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
            <Text numberOfLines={4} style={[commonStyles.tinyText]}>
              {item.note}
            </Text>
          </Column>
          <Column gap={6}>
            <Row alignItems="center">
              <Text style={commonStyles.tTinyText}>Creator: </Text>
              <Avatar
                name={
                  item?.createdByDetails
                    ? item?.createdByDetails?.name.split(" ")[0]
                    : item?.createdBy
                }
                image={item?.createdByDetails?.image}
                withName
              />
            </Row>
            <Text numberOfLines={5} style={commonStyles.tTinyText}>
              {formatDate(item?.createdAt)}
            </Text>
          </Column>
        </Column>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenWrapper title="Notes">
        <View style={[commonStyles.screenWrapper]}>
          {notes.length > 0 ? (
            <>
              <CustomInput
                placeholder="Search here..."
                onChangeText={searchNotes}
              />
              <FlatList
                data={notes}
                keyExtractor={(item) => item._id!}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={fetchNotes}
                contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
                numColumns={2}
              />
            </>
          ) : (
            <EmptyState
              text="No notes found"
              button={fetchNotes}
              loading={loading}
              error={!!error?.length}
            />
          )}
        </View>
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_NOTE)} />
      </ScreenWrapper>
    </>
  );
}
