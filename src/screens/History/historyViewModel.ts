import { useState, useEffect } from "react";
import { Task, TaskRepo } from "../../repositories/task";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";

export function useCompletedTasksViewModel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    const { data } = await getDataFromAsyncStorage<{ userId: string }>(
      LocalStorageKey.USER
    );
    if (data?.userId) {
      try {
        setLoading(true);
        const response = await TaskRepo.getCompletedTasks({
          ownerUserId: data?.userId,
        });
        setAllTasks(response);
        setTasks(response);
      } catch (err: any) {
        console.error("Fetch completed tasks error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await TaskRepo.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error("Delete task error:", err);
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const searchTasks = (searchText: string) => {
    if (!searchText.trim()) {
      setTasks(allTasks); // Reset to full list when search text is empty
      return;
    }

    const lowercasedText = searchText.toLowerCase();

    const filtered = allTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowercasedText);
      const descriptionMatch = task.description
        ? task.description.toLowerCase().includes(lowercasedText)
        : false;

      return titleMatch || descriptionMatch;
    });

    setTasks(filtered);
  };

  return {
    tasks,
    loading,
    error,
    fetchCompletedTasks,
    deleteTask,
    searchTasks,
  };
}
