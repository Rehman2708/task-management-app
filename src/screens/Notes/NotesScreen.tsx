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
import { Column, Row } from "../../tools";
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
    >
      <Column gap={8} style={commonStyles.cardContainer}>
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
          <Text numberOfLines={5} style={commonStyles.tinyText}>
            {formatDate(item?.createdAt)}
          </Text>
        </Row>
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
