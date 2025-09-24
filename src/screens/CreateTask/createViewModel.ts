import { useState } from "react";
import { TaskRepo } from "../../repositories/task";
import {
  AssignedTo,
  Frequency,
  Priority,
  SubtaskStatus,
} from "../../enums/tasks";
import {
  CreateTaskPayload,
  Subtask,
  UpdateTaskPayload,
} from "../../types/task";
import { useAuthStore } from "../../store/authStore";

export function useCreateTaskViewModel(initialTask?: any) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(
    initialTask?.description || ""
  );
  const [assignedTo, setAssignedTo] = useState<AssignedTo>(
    initialTask?.assignedTo || AssignedTo.Both
  );
  const [frequency, setFrequency] = useState<Frequency>(
    initialTask?.frequency || Frequency.Once
  );
  const [priority, setPriority] = useState<Priority>(
    initialTask?.priority || Priority.Low
  );
  const [image, setImage] = useState(initialTask?.image || "");
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    initialTask?.subtasks?.map((st: any) => ({
      _id: st._id,
      title: st.title,
      dueDateTime: new Date(st.dueDateTime),
      status: st.status || SubtaskStatus.Pending,
      completedAt: st.completedAt || null,
      updatedBy: st.updatedBy || null,
      comments: st.comments || [],
    })) || [
      {
        title: "",
        dueDateTime: new Date(Date.now() + 60 * 60 * 1000),
        status: SubtaskStatus.Pending,
      },
    ]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSubtask = () => {
    setSubtasks((prev) => [
      ...prev,
      {
        title: "",
        dueDateTime: new Date(Date.now() + 60 * 60 * 1000),
        status: SubtaskStatus.Pending,
      },
    ]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, field: keyof Subtask, value: any) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, [field]: value } : st))
    );
  };

  const saveTask = async () => {
    if (!title) {
      console.warn("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user?.userId) throw new Error("User not found");

      const payload: CreateTaskPayload | UpdateTaskPayload = {
        title,
        description,
        assignedTo,
        frequency,
        priority,
        image,
        ownerUserId: initialTask?.ownerUserId || user?.userId,
        createdBy: initialTask?.createdBy || user?.userId,
        subtasks: subtasks?.map((st) => ({
          title: st.title,
          dueDateTime: st.dueDateTime,
          status: st.status || SubtaskStatus.Pending,
          updatedBy: st.updatedBy || null,
          completedAt: st.completedAt || null,
          comments: st.comments || [],
        })),
      };

      let response;
      if (initialTask?._id) {
        response = await TaskRepo.updateTask(initialTask._id, payload);
      } else {
        response = await TaskRepo.createTask(payload);
      }
      setLoading(false);
      return response;
    } catch (err: any) {
      console.error("Save Task Error", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    assignedTo,
    setAssignedTo,
    frequency,
    setFrequency,
    priority,
    setPriority,
    subtasks,
    addSubtask,
    removeSubtask,
    updateSubtask,
    saveTask,
    loading,
    error,
    setImage,
    image,
  };
}
