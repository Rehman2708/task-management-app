import { useState, useEffect } from "react";
import { NotesRepo, Note } from "../../repositories/notes";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";

export function useNotesListViewModel(userId?: string) {
  const { user } = useAuthStore();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [cardView, setCardView] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // 🟢 First load or refresh
  const [loadingMore, setLoadingMore] = useState(false); // 🟢 Pagination
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const toggleSearch = () => setShowSearch((prev) => !prev);
  const toggleView = () => setCardView((prev) => !prev);

  useEffect(() => {
    setPage(1);
    setAllNotes([]);
    setNotes([]);
    fetchNotes(1, true);
  }, [user?.userId]);

  const fetchNotes = async (requestedPage = page, isInitial = false) => {
    if (!user?.userId) return;

    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);

      setError(null);

      const response = await NotesRepo.getAllNotes({
        ownerUserId: user.userId,
        page: requestedPage,
        pageSize,
      });

      const { notes: fetchedNotes, totalPages: total } = response;

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
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotes = () => {
    if (page < totalPages && !loadingMore) {
      fetchNotes(page + 1);
    }
  };

  const handlePinUnpinNote = async (noteId: string, pinned: boolean) => {
    try {
      setInitialLoading(true);
      await NotesRepo.pinNote(noteId, !pinned, user?.userId ?? "");
      fetchNotes(1, true);
    } catch (err: any) {
      console.error("Pin/unpin note error:", err);
      setError(err.message || "Failed to pin/unpin note");
    } finally {
      setInitialLoading(false);
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
    if (!searchText.trim()) {
      setNotes(allNotes);
      return;
    }
    const lower = searchText.toLowerCase();
    const filtered = allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(lower) ||
        note.note.toLowerCase().includes(lower)
    );
    setNotes(filtered);
  };

  const noteImages: string[] = notes
    .map((note) => note.image)
    .filter((img): img is string => !!img)
    .sort(() => Math.random() - 0.5);

  return {
    notes,
    initialLoading,
    loadingMore,
    error,
    fetchNotes,
    loadMoreNotes,
    pinUnpinNote,
    searchNotes,
    page,
    totalPages,
    showSearch,
    toggleSearch,
    noteImages,
    toggleView,
    cardView,
  };
}
