import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { Alert } from "react-native";
import { Task } from "../../types/task";
import { useAuthStore } from "../../store/authStore";

export function useCompletedTasksViewModel() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  useEffect(() => {
    fetchCompletedTasks(1, true);
  }, []);

  const fetchCompletedTasks = async (
    requestedPage = page,
    isInitial = false
  ) => {
    setError(null);
    if (!user?.userId) return;

    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);

      setError(null);

      const response = await TaskRepo.getCompletedTasks({
        ownerUserId: user.userId!,
        page: requestedPage,
        pageSize,
      });

      const { tasks: fetchedTasks, totalPages: total } = response;

      if (requestedPage === 1) {
        setTasks(fetchedTasks);
        setAllTasks(fetchedTasks);
      } else {
        setTasks((prev) => [...prev, ...fetchedTasks]);
        setAllTasks((prev) => [...prev, ...fetchedTasks]);
      }

      setTotalPages(total);
      setPage(requestedPage);
    } catch (err: any) {
      console.error("Fetch completed tasks error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = () => {
    if (page < totalPages && !loadingMore) {
      fetchCompletedTasks(page + 1);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setInitialLoading(true);
      await TaskRepo.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setAllTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error("Delete task error:", err);
      setError(err.message || "Failed to delete task");
    } finally {
      setInitialLoading(false);
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

  const searchTasks = (searchText: string) => {
    if (!searchText.trim()) {
      setTasks(allTasks);
      return;
    }

    const lower = searchText.toLowerCase();
    const filtered = allTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lower);
      const descMatch = task.description
        ? task.description.toLowerCase().includes(lower)
        : false;
      return titleMatch || descMatch;
    });

    setTasks(filtered);
  };

  return {
    tasks,
    initialLoading,
    loadingMore,
    error,
    fetchCompletedTasks,
    loadMoreTasks,
    deleteTask,
    searchTasks,
    page,
    totalPages,
    toggleSearch,
    showSearch,
  };
}
