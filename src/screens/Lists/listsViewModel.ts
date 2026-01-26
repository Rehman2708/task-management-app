import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { ListsRepo, List } from "../../repositories/lists";
import { useDebounce } from "../../hooks/useDebounce";

export function useListsViewModel(userId?: string) {
  const { user } = useAuthStore();

  const [lists, setLists] = useState<List[]>([]);
  const [cardView, setCardView] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
    setLists([]);
    fetchLists(1, true);
  }, [user?.userId]);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    fetchLists(1, true, debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const fetchLists = async (
    requestedPage = page,
    isInitial = false,
    search = debouncedSearchQuery,
  ) => {
    if (!user?.userId) return;
    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);
      setError(null);

      const response = await ListsRepo.getAllLists({
        ownerUserId: user.userId,
        page: requestedPage,
        pageSize,
        search: search.trim() || undefined,
      });

      const { lists: fetchedLists, totalPages: total } = response;
      if (requestedPage === 1) {
        setLists(fetchedLists);
      } else {
        setLists((prev) => [...prev, ...fetchedLists]);
      }
      setTotalPages(total);
      setPage(requestedPage);
    } catch (err: any) {
      console.error("Fetch lists error:", err);
      setError(err.message || "Failed to fetch lists");
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreLists = () => {
    if (page < totalPages && !loadingMore) {
      fetchLists(page + 1, false, debouncedSearchQuery);
    }
  };

  const handlePinUnpinList = async (listId: string, pinned: boolean) => {
    try {
      setInitialLoading(true);
      await ListsRepo.pinList(listId, !pinned, user?.userId ?? "");
      fetchLists(1, true, debouncedSearchQuery);
    } catch (err: any) {
      console.error("Pin/unpin list error:", err);
      setError(err.message || "Failed to pin/unpin list");
    } finally {
      setInitialLoading(false);
      setShowAlert(undefined);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Don't call fetchLists here - let the debounced effect handle it
  }, []);

  const listImages: string[] = lists
    .map((list) => list.image)
    .filter((img): img is string => !!img)
    .sort(() => Math.random() - 0.5);

  return {
    lists,
    initialLoading,
    loadingMore,
    error,
    fetchLists,
    loadMoreLists,
    handlePinUnpinList,
    showAlert,
    setShowAlert,
    page,
    totalPages,
    listImages,
    toggleView,
    cardView,
    pageSize,
    // Search functionality
    searchQuery,
    handleSearch,
  };
}
