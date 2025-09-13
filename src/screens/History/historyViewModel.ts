import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";

export function useCompletedTasksViewModel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
        setTasks(response);
      } catch (err: any) {
        console.error("Fetch completed tasks error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete a task
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

  return {
    tasks,
    loading,
    error,
    fetchCompletedTasks,
    deleteTask,
  };
}
