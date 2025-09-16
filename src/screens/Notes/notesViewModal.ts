import { useState, useEffect } from "react";
import { NotesRepo, Note } from "../../repositories/notes";
import { LocalStorageKey } from "../../enums/localstorage";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { useHelper } from "../../utils/helper";

export function useNotesListViewModel(userId?: string) {
  const [allNotes, setAllNotes] = useState<Note[]>([]); // Store full list
  const [notes, setNotes] = useState<Note[]>([]); // Store filtered list
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { loggedInUser } = useHelper();
  useEffect(() => {
    fetchNotes();
  }, [loggedInUser?.userId]);

  const fetchNotes = async () => {
    const { data } = await getDataFromAsyncStorage<{ userId: string }>(
      LocalStorageKey.USER
    );
    if (data?.userId) {
      try {
        setLoading(true);
        setError(null);
        const response = await NotesRepo.getAllNotes({
          ownerUserId: data?.userId,
        });
        setAllNotes(response);
        setNotes(response);
      } catch (err: any) {
        console.error("Fetch notes error:", err);
        setError(err.message || "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    }
  };

  const pinUnpinNote = async (noteId: string, pinned: boolean) => {
    try {
      setLoading(true);
      setError(null);

      await NotesRepo.pinNote(noteId, !pinned);
      fetchNotes();
    } catch (err: any) {
      console.error("Pin/unpin note error:", err);
      setError(err.message || "Failed to pin/unpin note");
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = (searchText: string) => {
    const filtered = allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.note.toLowerCase().includes(searchText.toLowerCase())
    );
    setNotes(filtered);
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
    pinUnpinNote,
    searchNotes,
  };
}
