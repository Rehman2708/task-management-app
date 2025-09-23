import { View, Text, Switch } from "react-native";
import { Note } from "../../repositories/notes";
import { useNoteDetailViewModel } from "./createNoteViewModal";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ROUTES } from "../../enums/routes";
import ImageModal from "../../components/imageModal";
import { useState } from "react";
import { Row } from "../../tools";

interface NoteDetailScreenProps {
  route: {
    params?: {
      note?: Note;
      userId: string;
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
    setNoteImage,
    noteImage,
  } = useNoteDetailViewModel(note);

  const navigation: any = useNavigation();
  const [appendMode, setAppendMode] = useState(false); // ⬅️ new state

  const handleSave = async () => {
    await saveNote(appendMode); // pass appendMode flag
    navigation.navigate(ROUTES.NOTES);
  };

  return (
    <ScreenWrapper
      title={note ? "Edit Note" : "Create Note"}
      showBackbutton
      subTitle={`Notes > ${note ? "Edit Note" : "Create Note"}`}
    >
      <View style={commonStyles.screenWrapper}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <ImageModal defaultImage={noteImage} onChange={setNoteImage} />

          <CustomInput
            title="Title"
            value={noteTitle}
            onChangeText={setNoteTitle}
            editable={!appendMode}
          />
          {note && (
            <Row alignItems="center" justifyContent="center" gap={8}>
              <Text style={commonStyles.smallText}>
                Append to existing note
              </Text>
              <Switch
                value={appendMode}
                onValueChange={(v) => {
                  setAppendMode(v);
                  if (v) setNoteText("");
                  else setNoteText(note.note);
                }}
              />
            </Row>
          )}
          <CustomInput
            title="Note"
            value={noteText}
            onChangeText={setNoteText}
            multiline
            placeholder={
              appendMode ? "Enter text to append…" : "Enter full note…"
            }
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}

          <CustomButton
            title={note?._id ? "Update" : "Save"}
            loading={loading}
            onPress={handleSave}
          />
        </KeyboardAwareScrollView>
      </View>
    </ScreenWrapper>
  );
}
