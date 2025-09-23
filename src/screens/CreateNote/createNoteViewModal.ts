import { useState, useEffect } from "react";
import {
  NotesRepo,
  Note,
  CreateNotePayload,
  UpdateNotePayload,
} from "../../repositories/notes";
import { useHelper } from "../../utils/helper";

export function useNoteDetailViewModel(note?: Note) {
  const [noteTitle, setNoteTitle] = useState<string>(note?.title || "");
  const [noteText, setNoteText] = useState<string>(note?.note || "");
  const [noteImage, setNoteImage] = useState<string>(note?.image || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { loggedInUser } = useHelper();

  useEffect(() => {
    if (note) {
      setNoteText(note.note);
      setNoteTitle(note.title);
      setNoteImage(note?.image ?? "");
    }
  }, [note]);

  const saveNote = async (append: boolean = false) => {
    if (!noteText.trim() && !(append && note?._id)) {
      setError("Note cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (note?._id) {
        // Edit existing note
        const payload: UpdateNotePayload = {
          title: noteTitle,
          note: append ? `${note.note}\n${noteText}` : noteText,
          image: noteImage,
        };
        const updatedNote = await NotesRepo.updateNote(note._id, payload);
        setSuccess(
          append ? "Text appended successfully" : "Note updated successfully"
        );
        setNoteText(updatedNote.note);
        setNoteTitle(updatedNote.title);
        setNoteImage(updatedNote.image);
      } else {
        // Create new note
        const payload: CreateNotePayload = {
          note: noteText,
          title: noteTitle,
          image: noteImage,
          createdBy: loggedInUser?.userId!,
        };
        const createdNote = await NotesRepo.createNote(payload);
        setSuccess("Note created successfully");
        setNoteText(createdNote.note);
      }
    } catch (err: any) {
      console.error("Save note error:", err);
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
