import { View, Text, Alert, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { Note, NotesRepo } from "../../repositories/notes";
import { useHelper } from "../../utils/helper";
import { useCommonStyles } from "../../styles/commonstyles";
import CustomButton from "../../components/customButton";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import { ROUTES } from "../../enums/routes";
import { useNavigation } from "@react-navigation/native";
import { LoaderTypes } from "../../components/screenLoader";
import { useUtilStore } from "../../store/utils";
import { useAuthStore } from "../../store/authStore";
import CollapsibleHeader from "../../components/collapsibleHeader";
import { useTheme } from "../../infrastructure/theme";
import EmptyState from "../../components/emptyState";
import { AppUrl } from "../../utils/appUrl";
import CommentsModal from "../../components/comments/commentModal";
import Ionicons from "@expo/vector-icons/build/Ionicons";

interface NoteDetailScreenProps {
  route: {
    params?: {
      noteId: string;
      userId: string;
      showComments?: boolean;
    };
  };
}

const ViewNoteScreen = ({ route }: NoteDetailScreenProps) => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const { refetchNotes } = useUtilStore();
  const { noteId, showComments } = route.params || {};
  const { formatDate } = useHelper();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<Note>();
  const [gettingNote, setGettingNote] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(
    showComments ?? false
  );
  const [totalComments, setTotalComments] = useState(
    note?.comments?.length ?? 0
  );
  const handleOpenComments = () => setCommentsModalVisible(true);
  const getNote = async () => {
    try {
      setGettingNote(true);
      if (noteId) {
        const data = await NotesRepo.getSingleNote(noteId);
        setNote(data);
        setTotalComments(data?.comments?.length ?? 0);
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
      <>
        <CollapsibleHeader
          headerImage={note?.image}
          title={note?.title}
          subTitle={formatDate(note?.createdAt!)}
        >
          {gettingNote ? (
            <EmptyState
              loading={gettingNote}
              type={LoaderTypes.NotesDetailScreen}
              text={""}
            />
          ) : (
            <>
              <Row justifyContent="space-between" alignItems="center">
                <Column>
                  <Text numberOfLines={3} style={commonStyles.titleText}>
                    {note?.title}
                  </Text>
                  <Text numberOfLines={3} style={commonStyles.tinyText}>
                    {formatDate(note?.createdAt!) ?? ""}
                  </Text>
                </Column>
                <Spacer size={6} position="right" />
                <Pressable onPress={() => handleOpenComments()}>
                  <Row alignItems="center" gap={6}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={theme.colors.text}
                    />
                    <Text style={commonStyles.smallText}>
                      {totalComments ?? 0} Comment
                      {totalComments > 1 ? "s" : ""}
                    </Text>
                  </Row>
                </Pressable>
              </Row>
              <Spacer size={12} />

              <Text style={commonStyles.basicText}>{note?.note}</Text>
              <Spacer size={50} />
            </>
          )}
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
      {note && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          fetchUrl={`${AppUrl.getNoteComments(note._id)}`}
          postUrl={`${AppUrl.addNoteComment(note._id)}`}
          entityId={note._id}
          setCount={setTotalComments}
        />
      )}
    </View>
  );
};

export default ViewNoteScreen;
