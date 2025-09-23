import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import {
  AddCommentPayload,
  CreateTaskPayload,
  UpdateSubtaskStatusPayload,
  UpdateTaskPayload,
} from "../types/task";
import { AppUrl } from "../utils/appUrl";

export class TaskRepo {
  static async getActiveTasks(params: { ownerUserId: string }) {
    const { ownerUserId } = params;
    let url = `${AppUrl.getAllTasks}/${ownerUserId}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Get completed/expired tasks
  // 🔹 Get completed/expired tasks (history) with optional pagination
  static async getCompletedTasks(params: {
    ownerUserId: string;
    page?: number;
    pageSize?: number;
  }) {
    const { ownerUserId, page, pageSize } = params;

    // Build query string only if pagination values exist
    const queryParts: string[] = [];
    if (page !== undefined) queryParts.push(`page=${page}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const url = `${AppUrl.getCompletedTasks}/${ownerUserId}${query}`;
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
