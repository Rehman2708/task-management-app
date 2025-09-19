import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

// Enums/types from backend
export type AssignedTo = "Me" | "Other" | "Both";
export type Priority = "Low" | "Medium" | "High";
export type Frequency = "Once" | "Daily" | "Weekly" | "Monthly";
export type TaskStatus = "Active" | "Completed" | "Expired";
export type SubtaskStatus = "Pending" | "Completed";

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
  comments?: { by: string; text: string }[];
}

export interface UpdateSubtaskStatusPayload {
  userId: string;
  status: "Pending" | "Completed";
}

export interface AddCommentPayload {
  userId?: string;
  by?: string; // for task-level comments
  text: string;
}

export class TaskRepo {
  static async getActiveTasks(params: { ownerUserId: string }) {
    const { ownerUserId } = params;
    let url = `${AppUrl.getAllTasks}/${ownerUserId}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Get completed/expired tasks
  static async getCompletedTasks(params: { ownerUserId: string }) {
    const { ownerUserId } = params;

    const url = `${AppUrl.getCompletedTasks}/${ownerUserId}`;

    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Get task by ID
  static async getTaskById(taskId: string) {
    return ApiService.getApiResponse(
      AppUrl.getTaskById(taskId),
      HttpMethods.GET
    );
  }

  // 🔹 Create a new task
  static async createTask(payload: CreateTaskPayload) {
    return ApiService.getApiResponse(
      AppUrl.createTask,
      HttpMethods.POST,
      payload
    );
  }

  // 🔹 Update/Edit a task
  static async updateTask(taskId: string, payload: UpdateTaskPayload) {
    return ApiService.getApiResponse(
      AppUrl.updateTask(taskId),
      HttpMethods.PUT,
      payload
    );
  }

  // 🔹 Delete a task
  static async deleteTask(taskId: string) {
    return ApiService.getApiResponse(
      AppUrl.deleteTask(taskId),
      HttpMethods.DELETE
    );
  }

  // 🔹 Add task-level comment
  static async addTaskComment(taskId: string, payload: AddCommentPayload) {
    return ApiService.getApiResponse(
      AppUrl.addTaskComment(taskId),
      HttpMethods.POST,
      payload
    );
  }

  // 🔹 Add comment to a subtask
  static async addSubtaskComment(
    taskId: string,
    subtaskId: string,
    payload: AddCommentPayload
  ) {
    return ApiService.getApiResponse(
      AppUrl.addSubtaskComment(taskId, subtaskId),
      HttpMethods.POST,
      payload
    );
  }

  // 🔹 Update subtask status
  static async updateSubtaskStatus(
    taskId: string,
    subtaskId: string,
    payload: UpdateSubtaskStatusPayload
  ) {
    return ApiService.getApiResponse(
      AppUrl.updateSubtaskStatus(taskId, subtaskId),
      HttpMethods.PATCH,
      payload
    );
  }
}
