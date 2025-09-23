import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { SubtaskStatus } from "../../enums/tasks";

export function useTaskDetailViewModel(taskId: string) {
  const [task, setTask] = useState<any>(null);
  const [taskDetailLoading, setTaskDetailLoading] = useState<boolean>(true);
  const [taskCommentLoading, setTaskCommentLoading] = useState<boolean>(false);
  const [subtaskCommentLoading, setSubtaskCommentLoading] =
    useState<boolean>(false);
  const [subtaskStatusLoading, setSubtaskStatusLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await getDataFromAsyncStorage<{ userId: string }>(
        LocalStorageKey.USER
      );
      if (data?.userId) setUserId(data.userId);
      fetchTaskDetail();
    })();
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
      setSubtaskStatusLoading(true);
      await TaskRepo.updateSubtaskStatus(taskId, subtaskId, { userId, status });
      fetchTaskDetail();
    } catch (err: any) {
      console.error("Update subtask status error:", err);
    } finally {
      setSubtaskStatusLoading(false);
    }
  };

  const addTaskComment = async (text: string) => {
    try {
      setTaskCommentLoading(true);
      await TaskRepo.addTaskComment(taskId, { by: userId, text });
      fetchTaskDetail();
    } catch (err: any) {
      console.error("Add task comment error:", err);
    } finally {
      setTaskCommentLoading(false);
    }
  };

  const addSubtaskComment = async (subtaskId: string, text: string) => {
    try {
      setSubtaskCommentLoading(true);
      await TaskRepo.addSubtaskComment(taskId, subtaskId, { userId, text });
      fetchTaskDetail();
    } catch (err: any) {
      console.error("Add subtask comment error:", err);
    } finally {
      setSubtaskCommentLoading(false);
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
