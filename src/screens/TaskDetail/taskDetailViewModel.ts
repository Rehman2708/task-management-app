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
    initializeTask();

    pollingRef.current = setInterval(fetchNewComments, 3000); // every 3s
    return () => pollingRef.current && clearInterval(pollingRef.current);
  }, [taskId]);

  // ---------- Initialize: fetch task + initial comments ----------
  const initializeTask = async () => {
    try {
      setTaskDetailLoading(true);
      const taskData = await TaskRepo.getTaskById(taskId);

      // Fetch comments separately for better performance
      const [taskComments, subtasksWithComments] = await Promise.all([
        TaskRepo.getTaskComments(taskId),
        Promise.all(
          (taskData.subtasks || []).map(async (s: any) => {
            const comments = await TaskRepo.getSubtaskComments(taskId, s._id);
            return { ...s, comments };
          })
        ),
      ]);

      setTask({
        ...taskData,
        comments: taskComments,
        subtasks: subtasksWithComments,
      });
    } catch (err: any) {
      console.error("Init task error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setTaskDetailLoading(false);
    }
  };

  // ---------- Poll only comments for live updates ----------
  const fetchNewComments = async () => {
    if (!task) return;

    try {
      // Fetch new task-level comments
      const newTaskComments = await TaskRepo.getTaskComments(taskId);

      // Fetch all subtask comments in parallel
      const newSubtasks = await Promise.all(
        task.subtasks.map(async (s: any) => {
          const comments = await TaskRepo.getSubtaskComments(taskId, s._id);
          return { ...s, comments };
        })
      );

      setTask((prev: any) => ({
        ...prev,
        comments:
          newTaskComments.length > (prev?.comments?.length || 0)
            ? newTaskComments
            : prev.comments,
        subtasks: newSubtasks.map((newS: any) => {
          const oldS = prev.subtasks.find((p: any) => p._id === newS._id);
          const oldC = oldS?.comments || [];
          const newC = newS.comments || [];
          return {
            ...newS,
            comments: newC.length > oldC.length ? newC : oldC,
          };
        }),
      }));
    } catch (err) {
      console.error("Polling comments error:", err);
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
    fetchTaskDetail: initializeTask,
    updateSubtaskStatus,
    addTaskComment,
    addSubtaskComment,
  };
}
