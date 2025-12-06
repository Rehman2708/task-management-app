import { useState, useRef } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { TaskRepo } from "../../repositories/task";
import { Task } from "../../types/task";

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

  // 🔥 request token to avoid race conditions
  const requestIdRef = useRef(0);

  const fetchTasks = async (
    requestedPage = 1,
    isInitial = true,
    forcedTab = tab
  ) => {
    if (!user?.userId) return;

    const requestId = ++requestIdRef.current; // new unique id
    setError(null);

    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const isActive = forcedTab === "Active";
      const response = isActive
        ? await TaskRepo.getActiveTasks({ ownerUserId: user.userId })
        : await TaskRepo.getCompletedTasks({
            ownerUserId: user.userId,
            page: requestedPage,
            pageSize,
          });

      // ❗ Ignore if outdated response (tab changed or new request triggered)
      if (requestId !== requestIdRef.current) return;

      const fetchedTasks = isActive ? response || [] : response?.tasks || [];
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

  const loadMoreTasks = () => {
    if (tab === "History" && page < totalPages && !loadingMore) {
      fetchTasks(page + 1, false, "History");
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
  };
}
