import { useState, useEffect } from "react";
import { NotesRepo, Note } from "../../repositories/notes";

export function useNotesListViewModel(userId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = userId ? { userId } : undefined;
      const response = await NotesRepo.getAllNotes(params);
      setNotes(response);
    } catch (err: any) {
      console.error("Fetch notes error:", err);
      setError(err.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setLoading(true);
      await NotesRepo.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err: any) {
      console.error("Delete note error:", err);
      setError(err.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, noteText: string) => {
    try {
      setLoading(true);
      const updatedNote = await NotesRepo.updateNote(noteId, {
        note: noteText,
      });
      setNotes((prev) =>
        prev.map((n) => (n._id === noteId ? { ...n, ...updatedNote } : n))
      );
    } catch (err: any) {
      console.error("Update note error:", err);
      setError(err.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
    deleteNote,
    updateNote,
  };
}
