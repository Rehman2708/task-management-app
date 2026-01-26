import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { TaskRepo } from "../../repositories/task";
import { Task } from "../../types/task";
import { useDebounce } from "../../hooks/useDebounce";

export function useHomeScreenViewModel() {
  const { user } = useAuthStore();

  const [tab, setTab] = useState<"Active" | "History">("Active");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

  // 🔥 request token to avoid race conditions
  const requestIdRef = useRef(0);

  const fetchTasks = async (
    requestedPage = 1,
    isInitial = true,
    forcedTab = tab,
    search = debouncedSearchQuery,
  ) => {
    if (!user?.userId) return;

    const requestId = ++requestIdRef.current; // new unique id
    setError(null);

    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const isActive = forcedTab === "Active";
      const response = isActive
        ? await TaskRepo.getActiveTasks({
            ownerUserId: user.userId,
            search: search.trim() || undefined,
          })
        : await TaskRepo.getCompletedTasks({
            ownerUserId: user.userId,
            page: requestedPage,
            pageSize,
            search: search.trim() || undefined,
          });

      // ❗ Ignore if outdated response (tab changed or new request triggered)
      if (requestId !== requestIdRef.current) return;

      const fetchedTasks = isActive
        ? response?.tasks || response || []
        : response?.tasks || [];
      const total = isActive ? 1 : response?.totalPages || 1;

      if (requestedPage === 1) setTasks(fetchedTasks);
      else setTasks((prev) => [...prev, ...fetchedTasks]);

      setTotalPages(total);
      setPage(requestedPage);
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      console.error("Fetch tasks error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    setSearching(true);
    fetchTasks(1, true, tab, debouncedSearchQuery).finally(() => {
      setSearching(false);
    });
  }, [debouncedSearchQuery, tab]);

  const loadMoreTasks = () => {
    if (tab === "History" && page < totalPages && !loadingMore) {
      fetchTasks(page + 1, false, "History", debouncedSearchQuery);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await TaskRepo.deleteTask(taskId, user?.userId ?? "");
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error("Delete task error:", err);
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
      setShowAlert(undefined);
    }
  };

  // Search functionality - no toggle needed
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearching(true);
    }
    // Don't call fetchTasks here - let the debounced effect handle it
  }, []);

  const taskImages: string[] = tasks
    .map((task) => task.image)
    .filter((img): img is string => !!img)
    .sort(() => Math.random() - 0.5);

  return {
    tasks,
    loading,
    loadingMore,
    error,
    tab,
    setTab,
    fetchTasks,
    loadMoreTasks,
    showAlert,
    setShowAlert,
    handleDeleteTask,
    taskImages,
    pageSize,
    // Search functionality
    searchQuery,
    handleSearch,
    searching,
  };
}
