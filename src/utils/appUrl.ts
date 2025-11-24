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
  public static updateFontEndPoint = `${this.BASE_URL}/auth/update-font`;
  public static updatePasswordEndPoint = `${this.BASE_URL}/auth/update-password`;
  // 🔹 Task APIs
  public static getAllTasks = `${this.BASE_URL}/tasks`;
  public static getCompletedTasks = `${this.BASE_URL}/tasks/history`;
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
  public static addNoteComment = (noteId: string) =>
    `${this.BASE_URL}/notes/${noteId}/comment`; // POST /notes/:id/comment
  public static getNoteComments = (noteId: string) =>
    `${this.BASE_URL}/notes/${noteId}/comments`; // GET /notes/:id/comments

  // 🔹 Lists APIs
  public static getAllLists = `${this.BASE_URL}/lists`; // e.g. GET /lists/:ownerUserId
  public static createList = `${this.BASE_URL}/lists`; // POST /lists
  public static getSingleList = (listId: string) =>
    `${this.BASE_URL}/lists/list/${listId}`; // GET /lists/list/:id
  public static updateList = (listId: string) =>
    `${this.BASE_URL}/lists/${listId}`; // PUT /lists/:id
  public static deleteList = (listId: string) =>
    `${this.BASE_URL}/lists/${listId}`; // DELETE /lists/:id
  public static pinUnpinList = (listId: string) =>
    `${this.BASE_URL}/lists/pin/${listId}`; // PATCH /lists/pin/:id
  public static toggleListItem = (listId: string, itemIndex: number) =>
    `${this.BASE_URL}/lists/toggle-item/${listId}/${itemIndex}`; // PATCH /lists/toggle-item/:listId/:itemIndex
  public static addListComment = (listId: string) =>
    `${this.BASE_URL}/lists/${listId}/comment`; // POST /lists/:id/comment
  public static getListComments = (listId: string) =>
    `${this.BASE_URL}/lists/${listId}/comments`; // GET /lists/:id/comments

  // 🔹 Videos APIs
  public static getAllVideos = `${this.BASE_URL}/videos`;
  public static createVideo = `${this.BASE_URL}/videos`;
  public static deleteVideo = (id: string) => `${this.BASE_URL}/videos/${id}`;
  public static markVideoAsViewed = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/viewed`;
  public static addVideoComment = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/comment`;
  public static getVideoComments = (videoId: string) =>
    `${this.BASE_URL}/videos/${videoId}/comments`;

  // 🔹 Notification APIs
  public static getNotifications = `${this.BASE_URL}/notifications`;
  public static markNotificationsRead = `${this.BASE_URL}/notifications/mark-read`;
}
