import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
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

export default function NotesScreen() {
  const userId = "TestUser"; // replace with loggedInUser.userId
  const { notes, loading, error, fetchNotes } = useNotesListViewModel(userId);
  const { formatDate } = useHelper();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(ROUTES.VIEW_NOTE, { note: item })}
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      <Column gap={6} style={commonStyles.cardContainer}>
        {item?.title && (
          <Text numberOfLines={1} style={commonStyles.basicText}>
            {item.title}
          </Text>
        )}
        <Text numberOfLines={4} style={commonStyles.tinyText}>
          {item.note}
        </Text>
        <Text numberOfLines={5} style={commonStyles.tTinyText}>
          Created By: {item.createdBy}
        </Text>
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
          {error && <Text style={styles.error}>{error}</Text>}
          {notes.length > 0 ? (
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
          ) : (
            <EmptyState
              text="No notes found"
              button={fetchNotes}
              loading={loading}
            />
          )}
        </View>
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_NOTE)} />
      </ScreenWrapper>
    </>
  );
}
