import { useState, useEffect, useCallback } from "react";
import { TaskRepo } from "../../repositories/task";
import { SubtaskStatus } from "../../enums/tasks";
import { useAuthStore } from "../../store/authStore";
import { useUtilStore } from "../../store/utils";

export function useTaskDetailViewModel(taskId: string) {
  const { user } = useAuthStore();
  const { refetchTask } = useUtilStore();

  const [task, setTask] = useState<any>(null);
  const [taskCommentCount, setTaskCommentCount] = useState(0);
  const [subtaskCommentCounts, setSubtaskCommentCounts] = useState<
    Record<string, number>
  >({});
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

      // Set task comment count
      setTaskCommentCount(taskData?.comments?.length ?? 0);

      // Set subtask comment counts
      const subtaskCounts: Record<string, number> = {};
      taskData?.subtasks?.forEach((subtask: any) => {
        subtaskCounts[subtask._id] = subtask?.comments?.length ?? 0;
      });
      setSubtaskCommentCounts(subtaskCounts);
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
      } catch (err) {
        console.error("Subtask update error:", err);
      } finally {
        setSubtaskStatusLoading(null);
      }
    },
    [taskId, user?.userId, refetchTask]
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
    taskCommentCount,
    setTaskCommentCount,
    subtaskCommentCounts,
    setSubtaskCommentCounts,
  };
}
