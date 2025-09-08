import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";

export function useHomeScreenViewModel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  // Fetch user from local storage
  useEffect(() => {
    (async () => {
      const { data } = await getDataFromAsyncStorage<{ userId: string }>(
        LocalStorageKey.USER
      );
      if (data?.userId) {
        setUserId(data.userId);
        fetchTasks();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch active tasks
  const fetchTasks = async () => {
    const { data } = await getDataFromAsyncStorage<{ userId: string }>(
      LocalStorageKey.USER
    );
    if (data?.userId) {
      try {
        setLoading(true);
        const response = await TaskRepo.getActiveTasks({
          ownerUserId: data.userId,
        });
        setTasks(response || []);
      } catch (err: any) {
        console.error("Fetch active tasks error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };
  return {
    tasks,
    loading,
    error,
    fetchTasks,
    userId,
  };
}
