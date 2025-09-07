import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useNotesListViewModel } from "./notesViewModal";
import FloatingAdd from "../../components/FloatingAdd";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { styles } from "./styles";
import { ROUTES } from "../../enums/routes";
import { Column, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";

export default function NotesScreen() {
  const userId = "TestUser"; // replace with loggedInUser.userId
  const { notes, loading, error, fetchNotes, deleteNote } =
    useNotesListViewModel(userId);

  const navigation = useNavigation();

  const handleDelete = (noteId: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteNote(noteId),
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Column gap={4} style={commonStyles.cardContainer}>
      {item?.title && (
        <Text numberOfLines={1} style={commonStyles.subTitleText}>
          {item.title}
        </Text>
      )}
      <Text numberOfLines={5} style={commonStyles.smallText}>
        {item.note}
      </Text>
      <Row justifyContent="space-between" alignItems="center">
        <Text numberOfLines={5} style={commonStyles.tinyText}>
          Created By: {item.createdBy}
        </Text>
        <Row gap={8}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(ROUTES.CREATE_NOTE, { note: item })
            }
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Row>
      </Row>
    </Column>
  );

  return (
    <>
      <ScreenWrapper title="Notes">
        <View style={[commonStyles.screenWrapper]}>
          {loading && (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          {notes.length > 0 ? (
            <FlatList
              data={notes}
              keyExtractor={(item) => item._id!}
              renderItem={renderItem}
              refreshing={loading}
              onRefresh={fetchNotes}
              contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
            />
          ) : (
            <EmptyState text="No notes found" />
          )}
        </View>
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_NOTE)} />
      </ScreenWrapper>
    </>
  );
}
