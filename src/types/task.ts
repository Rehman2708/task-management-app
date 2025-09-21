import {
  AssignedTo,
  Frequency,
  Priority,
  SubtaskStatus,
  TaskStatus,
} from "../enums/tasks";

export interface Subtask {
  _id?: string;
  title: string;
  status?: SubtaskStatus;
  dueDateTime: string | Date;
  completedAt?: string | Date | null;
  updatedBy?: string | null;
  comments?: { text: string; createdBy: string; createdAt?: Date }[];
}

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  ownerUserId: string;
  createdBy?: string;
  assignedTo?: AssignedTo;
  priority?: Priority;
  status?: TaskStatus;
  frequency?: Frequency;
  subtasks?: Subtask[];
  comments?: { by: string; text: string; date?: Date }[];
  template?: any; // optional for templates
  instances?: any[];
  nextDue?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Payloads
export interface CreateTaskPayload {
  title: string;
  image?: string;
  description?: string;
  ownerUserId: string;
  createdBy?: string;
  assignedTo?: AssignedTo;
  priority?: Priority;
  frequency?: Frequency;
  subtasks?: Subtask[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: AssignedTo;
  priority?: Priority;
  frequency?: Frequency;
  status?: TaskStatus;
  subtasks?: Subtask[];
  comments?: { createdBy: string; text: string }[];
}

export interface UpdateSubtaskStatusPayload {
  userId: string;
  status: "Pending" | "Completed";
}

export interface AddCommentPayload {
  userId?: string;
  createdBy?: string; // for task-level comments
  text: string;
}
