import {
  AssignedTo,
  Frequency,
  Priority,
  SubtaskStatus,
  TaskStatus,
} from "../enums/tasks";
export interface SubtaskComment {
  text: string;
  createdBy: string;
  createdAt?: string;
  createdByDetails?: {
    name: string;
    image?: string;
  };
}
export interface Subtask {
  _id?: string;
  title: string;
  status?: SubtaskStatus;
  dueDateTime: string | Date;
  completedAt?: string | Date | null;
  updatedBy?: string | null;
  comments?: SubtaskComment[];
}

export interface Task {
  _id?: string;
  image?: string;
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
  nextDue?: string;
  createdAt: string;
  updatedAt: Date;
  createdByDetails?: {
    image?: string;
    name?: string;
  };
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
