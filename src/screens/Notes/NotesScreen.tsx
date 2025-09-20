import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useNotesListViewModel } from "./notesViewModal";
import FloatingAdd from "../../components/FloatingAdd";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { styles } from "./styles";
import { ROUTES } from "../../enums/routes";
import { Column, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useHelper } from "../../utils/helper";
import { Note } from "../../repositories/notes";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../../components/customInput";
import Avatar from "../../components/avatar";

export default function NotesScreen() {
  const { formatDate, themeColor } = useHelper();

  const { notes, loading, error, fetchNotes, pinUnpinNote, searchNotes } =
    useNotesListViewModel();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [])
  );
  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onLongPress={() => pinUnpinNote(item._id, item.pinned ?? false)}
      onPress={() => navigation.navigate(ROUTES.VIEW_NOTE, { note: item })}
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      <Column gap={6} style={commonStyles.cardContainer}>
        <Row justifyContent="space-between" gap={8} alignItems="center">
          {item?.title && (
            <Text numberOfLines={1} style={commonStyles.basicText}>
              {item.title}
            </Text>
          )}
          {item.pinned && (
            <Ionicons
              size={16}
              color={themeColor.dark}
              name="pricetag-outline"
            />
          )}
        </Row>
        <Text numberOfLines={4} style={commonStyles.tinyText}>
          {item.note}
        </Text>
        <Row alignItems="center">
          <Text style={commonStyles.tTinyText}>Created by: </Text>
          <Avatar name={item?.createdBy} withName />
        </Row>
        <Text numberOfLines={5} style={commonStyles.tTinyText}>
          {formatDate(item?.createdAt)}
        </Text>
      </Column>
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
