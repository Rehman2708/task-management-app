import { View, Text, Switch } from "react-native";
import { Note } from "../../repositories/notes";
import { useNoteDetailViewModel } from "./createNoteViewModal";
import { createNoteStyle } from "./styles";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ROUTES } from "../../enums/routes";
import ImageModal from "../../components/imageModal";
import { useState } from "react";
import { Row } from "../../tools";
import { useTheme } from "../../infrastructure/theme";
import { useHelper } from "../../utils/helper";
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
  const theme = useTheme();
  const { triggerVibration, themeColor } = useHelper();
  const commonStyles = useCommonStyles(theme);
  const styles = createNoteStyle(theme);
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
      image={noteImage.length ? noteImage : undefined}
      noPadding
      // subTitle={`Notes > ${note ? "Edit Note" : "Create Note"}`}
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
                  triggerVibration();
                  setAppendMode(v);
                  if (v) setNoteText("");
                  else setNoteText(note.note);
                }}
                trackColor={{
                  true: themeColor.light,
                  false: theme.colors.border,
                }}
                thumbColor={themeColor.dark}
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
        </KeyboardAwareScrollView>
        <CustomButton
          title={note?._id ? "Update" : "Save"}
          loading={loading}
          onPress={handleSave}
        />
      </View>
    </ScreenWrapper>
  );
}
