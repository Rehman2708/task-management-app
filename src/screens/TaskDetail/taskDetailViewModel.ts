import { useState, useEffect, useCallback } from "react";
import { TaskRepo } from "../../repositories/task";
import { SubtaskStatus } from "../../enums/tasks";
import { useAuthStore } from "../../store/authStore";
import { useUtilStore } from "../../store/utils";

export function useTaskDetailViewModel(taskId: string) {
  const { user } = useAuthStore();
  const { refetchTask, refetchHistory } = useUtilStore();

  const [task, setTask] = useState<any>(null);
  const [taskDetailLoading, setTaskDetailLoading] = useState(true);
  const [subtaskStatusLoading, setSubtaskStatusLoading] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskDetail = useCallback(async () => {
    setTaskDetailLoading(true);
    setError(null);
    try {
      const taskData = await TaskRepo.getTaskById(taskId);
      setTask(taskData);
    } catch (err: any) {
      console.error("Task fetch error:", err);
      setError(err.message || "Unable to load task details");
    } finally {
      setTaskDetailLoading(false);
    }
  }, [taskId]);

  const updateSubtaskStatus = useCallback(
    async (subtaskId: string, status: SubtaskStatus) => {
      try {
        setSubtaskStatusLoading(subtaskId);
        await TaskRepo.updateSubtaskStatus(taskId, subtaskId, {
          userId: user?.userId ?? "",
          status,
        });

        setTask((prev: any) =>
          prev
            ? {
                ...prev,
                subtasks: prev.subtasks.map((s: any) =>
                  s._id === subtaskId ? { ...s, status } : s
                ),
              }
            : prev
        );

        refetchTask();
        refetchHistory();
      } catch (err) {
        console.error("Subtask update error:", err);
      } finally {
        setSubtaskStatusLoading(null);
      }
    },
    [taskId, user?.userId, refetchTask, refetchHistory]
  );

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  return {
    task,
    taskDetailLoading,
    error,
    fetchTaskDetail,
    updateSubtaskStatus,
    subtaskStatusLoading,
  };
}
