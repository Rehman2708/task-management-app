import { View, Text, Alert } from "react-native";
import { useEffect, useState } from "react";
import { Note, NotesRepo } from "../../repositories/notes";
import { useHelper } from "../../utils/helper";
import { commonStyles } from "../../styles/commonstyles";
import CustomButton from "../../components/customButton";
import { isAndroid, Row, Spacer } from "../../tools";
import { ROUTES } from "../../enums/routes";
import { useNavigation } from "@react-navigation/native";
import ScreenLoader from "../../components/screenLoader";
import { useUtilStore } from "../../store/utils";
import { useAuthStore } from "../../store/authStore";
import CollapsibleHeader from "../../components/collapsibleHeader";
import { theme } from "../../infrastructure/theme";

interface NoteDetailScreenProps {
  route: {
    params?: {
      noteId: string;
      userId: string;
    };
  };
}

const ViewNoteScreen = ({ route }: NoteDetailScreenProps) => {
  const { user } = useAuthStore();
  const { refetchNotes } = useUtilStore();
  const { noteId } = route.params || {};
  const { formatDate } = useHelper();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<Note>();
  const [gettingNote, setGettingNote] = useState(false);
  const getNote = async () => {
    try {
      setGettingNote(true);
      if (noteId) {
        const data = await NotesRepo.getSingleNote(noteId);
        setNote(data);
      }
    } catch (err: any) {
      console.error("get note error:", err);
    } finally {
      setGettingNote(false);
    }
  };

  const deleteNote = async () => {
    try {
      setLoading(true);
      await NotesRepo.deleteNote(note?._id!, user?.userId ?? "");
      refetchNotes();
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
  useEffect(() => {});
  useEffect(() => {
    getNote();
  }, []);
  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {gettingNote ? (
        <ScreenLoader />
      ) : (
        <>
          <CollapsibleHeader
            title={note?.title ?? ""}
            subTitle={formatDate(note?.createdAt!) ?? ""}
            headerImage={note?.image}
          >
            <Text style={commonStyles.basicText}>{note?.note}</Text>
            <Spacer size={50} />
          </CollapsibleHeader>
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
        </>
      )}
    </View>
  );
};

export default ViewNoteScreen;
