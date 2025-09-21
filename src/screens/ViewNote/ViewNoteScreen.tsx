import { View, Text, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Note, NotesRepo } from "../../repositories/notes";
import { useHelper } from "../../utils/helper";
import { commonStyles } from "../../styles/commonstyles";
import CustomButton from "../../components/customButton";
import { isAndroid, Row } from "../../tools";
import { ROUTES } from "../../enums/routes";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ImageModal from "../../components/imageModal";
interface NoteDetailScreenProps {
  route: {
    params?: {
      note: Note;
      userId: string;
    };
  };
}

const ViewNoteScreen = ({ route }: NoteDetailScreenProps) => {
  const { note } = route.params || {};
  const { formatDate } = useHelper();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const deleteNote = async () => {
    try {
      setLoading(true);
      await NotesRepo.deleteNote(note?._id!);
      navigation.goBack();
    } catch (err: any) {
      console.error("Delete note error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: deleteNote,
      },
    ]);
  };
  useFocusEffect(() => {});
  return (
    <ScreenWrapper
      title={note?.title}
      subTitle={formatDate(note?.createdAt!) ?? ""}
      showBackbutton
      image={note?.image}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={commonStyles.screenWrapper}
      >
        {note?.image && <ImageModal defaultImage={note?.image} disabled />}
        <Text style={commonStyles.basicText}>{note?.note}</Text>
      </ScrollView>
      <Row
        justifyContent="space-between"
        style={{ paddingHorizontal: isAndroid ? 8 : 16 }}
        alignItems="center"
      >
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate(ROUTES.CREATE_NOTE, { note })}
          rounded
          halfWidth
        />
        <CustomButton
          title="Delete"
          onPress={handleDelete}
          halfWidth
          rounded
          error
          loading={loading}
        />
      </Row>
    </ScreenWrapper>
  );
};

export default ViewNoteScreen;
