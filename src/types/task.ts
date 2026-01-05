import { Frequency, Priority, SubtaskStatus, TaskStatus } from "../enums/tasks";
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
  _id: string;
  title: string;
  status?: SubtaskStatus;
  assignedTo?: "Me" | "Partner" | "Both";
  completedBy?: string[]; // Array of userIds who completed this subtask
  dueDateTime: string;
  completedAt?: string | Date | null;
  updatedBy?: string | null;
  comments?: SubtaskComment[];
  totalComments?: number;
}

export interface Task {
  _id?: string;
  image?: string;
  title: string;
  description?: string;
  ownerUserId: string;
  createdBy?: string;
  priority?: Priority;
  status?: TaskStatus;
  frequency?: Frequency;
  assignedTo?: "Me" | "Partner" | "Both"; // Task-level assignment for legacy support
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
  totalComments: number;
}

// Payloads
export interface CreateTaskPayload {
  title: string;
  image?: string;
  description?: string;
  ownerUserId: string;
  createdBy?: string;
  priority?: Priority;
  frequency?: Frequency;
  assignedTo?: "Me" | "Partner" | "Both"; // Task-level assignment for legacy support
  subtasks?: Subtask[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  frequency?: Frequency;
  status?: TaskStatus;
  assignedTo?: "Me" | "Partner" | "Both"; // Task-level assignment for legacy support
  subtasks?: Subtask[];
  comments?: { createdBy: string; text: string }[];
}

export interface UpdateSubtaskStatusPayload {
  userId: string;
  status: SubtaskStatus;
}

export interface AddCommentPayload {
  userId?: string;
  createdBy?: string; // for task-level comments
  by?: string; // for task-level comments
  text: string;
}
