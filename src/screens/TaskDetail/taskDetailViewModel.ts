import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { SubtaskStatus } from "../../enums/tasks";
import { useAuthStore } from "../../store/authStore";

export function useTaskDetailViewModel(taskId: string) {
  const { user } = useAuthStore();
  const [task, setTask] = useState<any>(null);
  const [taskDetailLoading, setTaskDetailLoading] = useState(true);
  const [taskCommentLoading, setTaskCommentLoading] = useState(false);
  const [subtaskCommentLoading, setSubtaskCommentLoading] = useState<
    string | null
  >(null);
  const [subtaskStatusLoading, setSubtaskStatusLoading] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (user?.userId) setUserId(user.userId);
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      setTaskDetailLoading(true);
      const response = await TaskRepo.getTaskById(taskId);
      setTask(response);
    } catch (err: any) {
      console.error("Fetch task detail error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setTaskDetailLoading(false);
    }
  };

  const updateSubtaskStatus = async (
    subtaskId: string,
    status: SubtaskStatus
  ) => {
    try {
      setSubtaskStatusLoading(subtaskId);
      await TaskRepo.updateSubtaskStatus(taskId, subtaskId, { userId, status });

      // Update locally instead of refetching
      setTask((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s: any) =>
            s._id === subtaskId ? { ...s, status } : s
          ),
        };
      });
    } catch (err: any) {
      console.error("Update subtask status error:", err);
    } finally {
      setSubtaskStatusLoading(null);
    }
  };

  const addTaskComment = async (text: string) => {
    try {
      setTaskCommentLoading(true);

      // Call API (don’t rely on return for UI)
      await TaskRepo.addTaskComment(taskId, { by: userId, text });

      // Create local comment object
      const newComment = {
        _id: Date.now().toString(), // temporary ID
        text,
        createdBy: userId,
        createdByDetails: {
          name: user?.name || "You",
          image: user?.image || null,
        },
        date: new Date().toISOString(),
      };

      // Append to state
      setTask((prev: any) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), newComment] }
          : prev
      );
    } catch (err: any) {
      console.error("Add task comment error:", err);
    } finally {
      setTaskCommentLoading(false);
    }
  };

  const addSubtaskComment = async (subtaskId: string, text: string) => {
    try {
      setSubtaskCommentLoading(subtaskId);

      await TaskRepo.addSubtaskComment(taskId, subtaskId, { userId, text });

      // Create local comment object
      const newComment = {
        _id: Date.now().toString(),
        text,
        createdBy: userId,
        createdByDetails: {
          name: user?.name || "You",
          image: user?.image || null,
        },
        createdAt: new Date().toISOString(),
      };

      // Append to correct subtask
      setTask((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s: any) =>
            s._id === subtaskId
              ? { ...s, comments: [...(s.comments || []), newComment] }
              : s
          ),
        };
      });
    } catch (err: any) {
      console.error("Add subtask comment error:", err);
    } finally {
      setSubtaskCommentLoading(null);
    }
  };

  return {
    task,
    taskDetailLoading,
    taskCommentLoading,
    subtaskCommentLoading, // holds subtaskId when loading
    subtaskStatusLoading, // holds subtaskId when loading
    error,
    userId,
    fetchTaskDetail,
    updateSubtaskStatus,
    addTaskComment,
    addSubtaskComment,
  };
}
