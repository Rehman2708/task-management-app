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
