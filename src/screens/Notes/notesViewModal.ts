import { useState, useEffect } from "react";
import { NotesRepo, Note } from "../../repositories/notes";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";

export function useNotesListViewModel(userId?: string) {
  const { user } = useAuthStore();
  const [allNotes, setAllNotes] = useState<Note[]>([]); // All fetched notes
  const [notes, setNotes] = useState<Note[]>([]); // Filtered (search) notes
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  useEffect(() => {
    // Reset to first page whenever user changes
    setPage(1);
    setAllNotes([]);
    setNotes([]);
    fetchNotes(1);
  }, [user?.userId]);

  const fetchNotes = async (requestedPage = page) => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await NotesRepo.getAllNotes({
        ownerUserId: user.userId,
        page: requestedPage,
        pageSize,
      });

      // API now returns { notes, totalPages, currentPage }
      const { notes: fetchedNotes, totalPages: total } = response;

      // If requesting page 1, replace; otherwise append
      if (requestedPage === 1) {
        setAllNotes(fetchedNotes);
        setNotes(fetchedNotes);
      } else {
        setAllNotes((prev) => [...prev, ...fetchedNotes]);
        setNotes((prev) => [...prev, ...fetchedNotes]);
      }

      setTotalPages(total);
      setPage(requestedPage);
    } catch (err: any) {
      console.error("Fetch notes error:", err);
      setError(err.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load next page if available
  const loadMoreNotes = () => {
    if (page < totalPages && !loading) {
      fetchNotes(page + 1);
    }
  };

  const handlePinUnpinNote = async (noteId: string, pinned: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await NotesRepo.pinNote(noteId, !pinned);

      // Refresh all notes from page 1 after pin/unpin
      fetchNotes(1);
    } catch (err: any) {
      console.error("Pin/unpin note error:", err);
      setError(err.message || "Failed to pin/unpin note");
    } finally {
      setLoading(false);
    }
  };

  const pinUnpinNote = (noteId: string, pinned: boolean) => {
    Alert.alert(
      `${!pinned ? "Pin" : "Unpin"} Note?`,
      `${!pinned ? "Pin" : "Unpin"} this note?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => handlePinUnpinNote(noteId, pinned),
        },
      ]
    );
  };

  const searchNotes = (searchText: string) => {
    const lower = searchText.toLowerCase();
    const filtered = allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(lower) ||
        note.note.toLowerCase().includes(lower)
    );
    setNotes(filtered);
  };

  return {
    notes,
    loading,
    error,
    fetchNotes, // Manual refresh
    loadMoreNotes, // Load next page for infinite scroll
    pinUnpinNote,
    searchNotes,
    page,
    totalPages,
    showSearch,
    toggleSearch,
  };
}
