import { useState, useEffect } from "react";
import { NotesRepo, Note } from "../../repositories/notes";
import { LocalStorageKey } from "../../enums/localstorage";
import { getDataFromAsyncStorage } from "../../utils/localstorage";

export function useNotesListViewModel(userId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    const { data } = await getDataFromAsyncStorage<{ userId: string }>(
      LocalStorageKey.USER
    );
    if (data?.userId) {
      try {
        setLoading(true);
        setError(null);
        if (!userId) throw new Error("User ID is required");
        const response = await NotesRepo.getAllNotes({
          ownerUserId: data?.userId,
        });
        setNotes(response);
      } catch (err: any) {
        console.error("Fetch notes error:", err);
        setError(err.message || "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
  };
}
