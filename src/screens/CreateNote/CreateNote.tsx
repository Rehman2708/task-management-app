import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Note } from "../../repositories/notes";
import { useNoteDetailViewModel } from "./createNoteViewModal";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface NoteDetailScreenProps {
  route: {
    params?: {
      note?: Note; // if editing
      userId: string; // logged-in user
    };
  };
}

export default function NoteDetailScreen({ route }: NoteDetailScreenProps) {
  const { note } = route.params || {};
  const {
    noteText,
    setNoteText,
    noteTitle,
    setNoteTitle,
    loading,
    error,
    success,
    saveNote,
    deleteNote,
  } = useNoteDetailViewModel(note);
  const navigation = useNavigation();
  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSave = async () => {
    await saveNote();
    navigation.goBack();
  };

  return (
    <ScreenWrapper
      title={note ? "Edit Note" : "Create Note"}
      showBackbutton
      subTitle={`Notes > ${note ? "Edit Note" : "Create Note"}`}
    >
      <View style={[commonStyles.screenWrapper]}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <CustomInput
            title="Title"
            value={noteTitle}
            onChangeText={setNoteTitle}
          />
          <CustomInput
            title="Note"
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}

          <CustomButton
            title={note?._id ? "Update" : "Save"}
            loading={loading}
            onPress={handleSave}
          />
        </KeyboardAwareScrollView>
        {note?._id && (
          <CustomButton
            title="Delete"
            loading={loading}
            onPress={handleDelete}
            error
            rounded
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
