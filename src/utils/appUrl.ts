import { BASE_URL } from "./api";

export class AppUrl {
  public static readonly BASE_URL = BASE_URL;

  // 🔹 Auth APIs
  public static loginEndPoint = `${this.BASE_URL}/auth/login`;
  public static registerEndPoint = `${this.BASE_URL}/auth/register`;
  public static connectPartnerEndPoint = `${this.BASE_URL}/auth/connect-partner`;
  public static getUserEndPoint = (userId: string) =>
    `${this.BASE_URL}/auth/${userId}`;
  public static logoutEndPoint = `${this.BASE_URL}/auth/logout`;
  public static updateProfileEndPoint = `${this.BASE_URL}/auth/update-profile`;
  public static updateThemeEndPoint = `${this.BASE_URL}/auth/update-theme`;
  // 🔹 Task APIs
  public static getAllTasks = `${this.BASE_URL}/tasks`; // active tasks only
  public static getCompletedTasks = `${this.BASE_URL}/tasks/history`; // completed/expired tasks
  public static createTask = `${this.BASE_URL}/tasks`;
  public static getTaskById = (taskId: string) =>
    `${this.BASE_URL}/tasks/task/${taskId}`;
  public static updateTask = (taskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}`;
  public static deleteTask = (taskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}`;

  // 🔹 Task Instances & Subtasks
  public static addTaskInstance = (taskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/instance`;
  public static updateSubtaskStatus = (taskId: string, subtaskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/subtask/${subtaskId}/status`;
  public static addTaskComment = (taskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/comment`;
  public static addSubtaskComment = (taskId: string, subtaskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/subtask/${subtaskId}/comment`;
  public static getTaskComments = (taskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/comments`;
  public static getSubtaskComments = (taskId: string, subtaskId: string) =>
    `${this.BASE_URL}/tasks/${taskId}/subtask/${subtaskId}/comments`;

  // 🔹 Notification
  public static sendNotification = `${this.BASE_URL}/notifications`;

  // 🔹 Notes APIs
  public static getAllNotes = `${this.BASE_URL}/notes`;
  public static createNote = `${this.BASE_URL}/notes`;
  public static updateNote = (noteId: string) =>
    `${this.BASE_URL}/notes/${noteId}`;
  public static deleteNote = (noteId: string) =>
    `${this.BASE_URL}/notes/${noteId}`;
  public static pinUnpinNote = (noteId: string) =>
    `${this.BASE_URL}/notes/pin/${noteId}`;
  public static getSingleNote = (noteId: string) =>
    `${this.BASE_URL}/notes/note/${noteId}`;

  // 🔹 Videos APIs
  public static getAllVideos = `${this.BASE_URL}/videos`; // e.g., GET /videos/user/:ownerUserId
  public static createVideo = `${this.BASE_URL}/videos`; // POST /videos
  public static deleteVideo = (id: string) => `${this.BASE_URL}/videos/${id}`; // DELETE /videos/:id
  public static markVideoAsViewed = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/viewed`;
  public static addVideoComment = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/comment`;
  public static getVideoComments = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/comments`;

  // 🔹 Notification APIs
  public static getNotifications = `${this.BASE_URL}/notifications`; // plural to match your router
  public static markNotificationsRead = `${this.BASE_URL}/notifications/mark-read`;
}
