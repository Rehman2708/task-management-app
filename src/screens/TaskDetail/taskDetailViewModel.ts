import { useState, useEffect, useRef } from "react";
import { TaskRepo } from "../../repositories/task";
import { SubtaskStatus } from "../../enums/tasks";
import { useAuthStore } from "../../store/authStore";
import { useUtilStore } from "../../store/utils";

export function useTaskDetailViewModel(taskId: string) {
  const { user } = useAuthStore();
  const { refetchTask, refetchHistory } = useUtilStore();
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

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.userId) setUserId(user.userId);
    fetchTaskDetail();

    // Start background polling (real-time like updates)
    pollingRef.current = setInterval(fetchNewComments, 3000); // every 3s
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [taskId]);

  // ---------- Fetch Task Details ----------
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

  // ---------- Polling Helper: merge only new comments ----------
  const fetchNewComments = async () => {
    try {
      const response = await TaskRepo.getTaskById(taskId);

      setTask((prev: any) => {
        if (!prev) return response;

        // Merge new task comments
        const oldComments = prev.comments || [];
        const newComments = response.comments || [];
        const mergedComments =
          newComments.length > oldComments.length ? newComments : oldComments;

        // Merge new subtask comments individually
        const mergedSubtasks = prev.subtasks?.map((oldSubtask: any) => {
          const newSubtask = response.subtasks?.find(
            (s: any) => s._id === oldSubtask._id
          );
          if (!newSubtask) return oldSubtask;

          const oldC = oldSubtask.comments || [];
          const newC = newSubtask.comments || [];

          return {
            ...oldSubtask,
            comments: newC.length > oldC.length ? newC : oldC,
          };
        });

        return {
          ...prev,
          comments: mergedComments,
          subtasks: mergedSubtasks || prev.subtasks,
        };
      });
    } catch (err) {
      console.error("Polling fetch error:", err);
    }
  };

  // ---------- Update Subtask Status ----------
  const updateSubtaskStatus = async (
    subtaskId: string,
    status: SubtaskStatus
  ) => {
    try {
      setSubtaskStatusLoading(subtaskId);
      await TaskRepo.updateSubtaskStatus(taskId, subtaskId, { userId, status });

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
    } catch (err) {
      console.error("Update subtask status error:", err);
    } finally {
      refetchTask();
      refetchHistory();
      setSubtaskStatusLoading(null);
    }
  };

  // ---------- Add Task Comment ----------
  const addTaskComment = async (text: string) => {
    try {
      setTaskCommentLoading(true);
      await TaskRepo.addTaskComment(taskId, { by: userId, text });

      const newComment = {
        _id: Date.now().toString(),
        text,
        createdBy: userId,
        createdByDetails: {
          name: user?.name || "You",
          image: user?.image || null,
        },
        date: new Date().toISOString(),
      };

      setTask((prev: any) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), newComment] }
          : prev
      );
    } catch (err) {
      console.error("Add task comment error:", err);
    } finally {
      setTaskCommentLoading(false);
    }
  };

  // ---------- Add Subtask Comment ----------
  const addSubtaskComment = async (subtaskId: string, text: string) => {
    try {
      setSubtaskCommentLoading(subtaskId);
      await TaskRepo.addSubtaskComment(taskId, subtaskId, { userId, text });

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
    } catch (err) {
      console.error("Add subtask comment error:", err);
    } finally {
      setSubtaskCommentLoading(null);
    }
  };

  return {
    task,
    taskDetailLoading,
    taskCommentLoading,
    subtaskCommentLoading,
    subtaskStatusLoading,
    error,
    userId,
    fetchTaskDetail,
    updateSubtaskStatus,
    addTaskComment,
    addSubtaskComment,
  };
}
