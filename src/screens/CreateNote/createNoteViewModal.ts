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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { loggedInUser } = useHelper();

  useEffect(() => {
    if (note) {
      setNoteText(note.note);
      setNoteTitle(note.title);
    }
  }, [note]);

  const saveNote = async () => {
    if (!noteText.trim()) {
      setError("Note cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (note?._id) {
        // Edit existing note
        const payload: UpdateNotePayload = { title: noteTitle, note: noteText };
        const updatedNote = await NotesRepo.updateNote(note._id, payload);
        setSuccess("Note updated successfully");
        setNoteText(updatedNote.note);
        setNoteTitle(updatedNote.title);
      } else {
        // Create new note
        const payload: CreateNotePayload = {
          note: noteText,
          title: noteTitle,
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

  const deleteNote = async () => {
    if (!note?._id) return;

    try {
      setLoading(true);
      await NotesRepo.deleteNote(note._id);
      setSuccess("Note deleted successfully");
      setNoteText("");
    } catch (err: any) {
      console.error("Delete note error:", err);
      setError(err.message || "Failed to delete note");
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
    deleteNote,
  };
}
