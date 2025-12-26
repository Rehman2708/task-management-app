/**
 * Utility functions for handling notifications
 */

export interface NotificationData {
  type?: string;
  isComment?: boolean;
  isGrouped?: boolean;
  categoryId?: string;
  commentCount?: number;
  taskId?: string;
  noteId?: string;
  listId?: string;
  videoData?: any;
  [key: string]: any;
}

/**
 * Check if a notification is a comment notification
 */
export function isCommentNotification(
  data: NotificationData | null | undefined
): boolean {
  if (!data) return false;

  // Check for explicit comment flags
  if (data.isComment || data.isGrouped) return true;

  // Check for comment category IDs
  if (data.categoryId && data.categoryId.includes("comment")) return true;

  // Check for comment type
  if (data.type === "comment") return true;

  return false;
}

/**
 * Get a user-friendly title for comment notifications
 */
export function getCommentNotificationTitle(
  originalTitle: string,
  data: NotificationData
): string {
  if (data.isGrouped && data.commentCount && data.commentCount > 1) {
    return `💬 ${data.commentCount} new comments`;
  }

  if (data.isComment) {
    return originalTitle || "💬 New Comment";
  }

  return originalTitle;
}

/**
 * Get notification type display name
 */
export function getNotificationTypeDisplayName(type: string): string {
  switch (type) {
    case "task":
      return "Task";
    case "note":
      return "Note";
    case "list":
      return "List";
    case "video":
      return "Video";
    default:
      return "Item";
  }
}

/**
 * Show a success notification
 */
export async function showSuccessNotification(title: string, body: string) {
  const { default: Notifications } = await import("expo-notifications");

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: "success" },
    },
    trigger: null,
  });
}

/**
 * Show an error notification
 */
export async function showErrorNotification(title: string, body: string) {
  const { default: Notifications } = await import("expo-notifications");

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: "error" },
    },
    trigger: null,
  });
}
