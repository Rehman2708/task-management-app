import { useState, useEffect, useCallback } from "react";
import { NotesRepo, Note } from "../../repositories/notes";
import { useAuthStore } from "../../store/authStore";
import { useDebounce } from "../../hooks/useDebounce";

export function useNotesListViewModel(userId?: string) {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [cardView, setCardView] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // 🟢 First load or refresh
  const [loadingMore, setLoadingMore] = useState(false); // 🟢 Pagination
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showAlert, setShowAlert] = useState<string | undefined>(undefined);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

  const toggleView = () => setCardView((prev) => !prev);

  useEffect(() => {
    setPage(1);
    setNotes([]);
    fetchNotes(1, true);
  }, [user?.userId]);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    fetchNotes(1, true, debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const fetchNotes = async (
    requestedPage = page,
    isInitial = false,
    search = debouncedSearchQuery,
  ) => {
    if (!user?.userId) return;

    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);

      setError(null);

      const response = await NotesRepo.getAllNotes({
        ownerUserId: user.userId,
        page: requestedPage,
        pageSize,
        search: search.trim() || undefined,
      });

      const { notes: fetchedNotes, totalPages: total } = response;

      if (requestedPage === 1) {
        setNotes(fetchedNotes);
      } else {
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
      fetchNotes(page + 1, false, debouncedSearchQuery);
    }
  };

  const handlePinUnpinNote = async (noteId: string, pinned: boolean) => {
    try {
      setInitialLoading(true);
      await NotesRepo.pinNote(noteId, !pinned, user?.userId ?? "");
      fetchNotes(1, true, debouncedSearchQuery);
    } catch (err: any) {
      console.error("Pin/unpin note error:", err);
      setError(err.message || "Failed to pin/unpin note");
    } finally {
      setInitialLoading(false);
      setShowAlert(undefined);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Don't call fetchNotes here - let the debounced effect handle it
  }, []);

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
    handlePinUnpinNote,
    showAlert,
    setShowAlert,
    page,
    totalPages,
    noteImages,
    toggleView,
    cardView,
    pageSize,
    // Search functionality
    searchQuery,
    handleSearch,
  };
}
