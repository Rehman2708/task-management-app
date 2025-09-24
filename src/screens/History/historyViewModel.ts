import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { Alert } from "react-native";
import { Task } from "../../types/task";
import { useAuthStore } from "../../store/authStore";

export function useCompletedTasksViewModel() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // For search filtering
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  useEffect(() => {
    fetchCompletedTasks(1); // Initial load of first page
  }, []);

  const fetchCompletedTasks = async (requestedPage = page) => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await TaskRepo.getCompletedTasks({
        ownerUserId: user?.userId!,
        page: requestedPage,
        pageSize,
      });

      // The API returns { tasks, totalPages, currentPage }
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
      setLoading(false);
    }
  };

  // 🔹 Load next page for infinite scroll
  const loadMoreTasks = () => {
    if (page < totalPages && !loading) {
      fetchCompletedTasks(page + 1);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await TaskRepo.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setAllTasks((prev) => prev.filter((task) => task._id !== taskId));
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
    loading,
    error,
    fetchCompletedTasks, // Refresh from page 1
    loadMoreTasks, // Load next page for infinite scroll
    deleteTask,
    searchTasks,
    page,
    totalPages,
    toggleSearch,
    showSearch,
  };
}
