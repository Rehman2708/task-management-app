import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { ListsRepo, List } from "../../repositories/lists";

export function useListsViewModel(userId?: string) {
  const { user } = useAuthStore();

  const [allLists, setAllLists] = useState<List[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [cardView, setCardView] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const toggleSearch = () => setShowSearch((prev) => !prev);
  const toggleView = () => setCardView((prev) => !prev);

  useEffect(() => {
    setPage(1);
    setAllLists([]);
    setLists([]);
    fetchLists(1, true);
  }, [user?.userId]);

  const fetchLists = async (requestedPage = page, isInitial = false) => {
    if (!user?.userId) return;
    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);
      setError(null);

      const response = await ListsRepo.getAllLists({
        ownerUserId: user.userId,
        page: requestedPage,
        pageSize,
      });

      const { lists: fetchedLists, totalPages: total } = response;
      if (requestedPage === 1) {
        setAllLists(fetchedLists);
        setLists(fetchedLists);
      } else {
        setAllLists((prev) => [...prev, ...fetchedLists]);
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
      fetchLists(page + 1);
    }
  };

  const handlePinUnpinList = async (listId: string, pinned: boolean) => {
    try {
      setInitialLoading(true);
      await ListsRepo.pinList(listId, !pinned, user?.userId ?? "");
      fetchLists(1, true);
    } catch (err: any) {
      console.error("Pin/unpin list error:", err);
      setError(err.message || "Failed to pin/unpin list");
    } finally {
      setInitialLoading(false);
    }
  };

  const pinUnpinList = (listId: string, pinned: boolean) => {
    Alert.alert(
      `${!pinned ? "Pin" : "Unpin"} List?`,
      `${!pinned ? "Pin" : "Unpin"} this list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => handlePinUnpinList(listId, pinned),
        },
      ]
    );
  };

  const searchLists = (searchText: string) => {
    if (!searchText.trim()) {
      setLists(allLists);
      return;
    }

    const lower = searchText.toLowerCase();
    const filtered = allLists.filter(
      (list) =>
        list.title.toLowerCase().includes(lower) ||
        list.items.some((item) => item.text.toLowerCase().includes(lower))
    );
    setLists(filtered);
  };

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
    pinUnpinList,
    searchLists,
    page,
    totalPages,
    showSearch,
    toggleSearch,
    listImages,
    toggleView,
    cardView,
  };
}
