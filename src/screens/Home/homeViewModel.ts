import { useState } from "react";
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

  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Tasks (Active/History)
  const fetchTasks = async (requestedPage = 1, isInitial = true) => {
    if (!user?.userId) return;
    setError(null);

    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const response =
        tab === "Active"
          ? await TaskRepo.getActiveTasks({
              ownerUserId: user.userId,
            })
          : await TaskRepo.getCompletedTasks({
              ownerUserId: user.userId,
              page: requestedPage,
              pageSize,
            });

      const fetchedTasks =
        tab === "Active" ? response || [] : response?.tasks || [];
      const total = tab === "Active" ? 1 : response?.totalPages || 1;

      if (requestedPage === 1) {
        setTasks(fetchedTasks);
      } else {
        setTasks((prev) => [...prev, ...fetchedTasks]);
      }

      setTotalPages(total);
      setPage(requestedPage);
    } catch (err: any) {
      console.error("Fetch tasks error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load More Tasks
  const loadMoreTasks = () => {
    if (tab === "History" && page < totalPages && !loadingMore) {
      fetchTasks(page + 1, false);
    }
  };

  // Delete a Task
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
    }
  };

  const deleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteTask(taskId),
      },
    ]);
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
    deleteTask,
    taskImages,
  };
}
