import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";

export function useCompletedTasksViewModel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      const response = await TaskRepo.getCompletedTasks({
        ownerUserId: "Test",
      });
      setTasks(response);
    } catch (err: any) {
      console.error("Fetch completed tasks error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchCompletedTasks,
  };
}
