import * as Notifications from "expo-notifications";

/**
 * Clear all notifications for a specific group (e.g., when user opens the item)
 */
export const clearNotificationGroup = async (groupId: string) => {
  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();

    for (const notification of notifications) {
      const data = notification.request.content.data;
      if (
        data?.groupId === groupId ||
        data?.taskId === groupId ||
        data?.noteId === groupId ||
        data?.listId === groupId
      ) {
        await Notifications.dismissNotificationAsync(
          notification.request.identifier
        );
      }
    }

    console.log(`🧹 Cleared notifications for group: ${groupId}`);
  } catch (error) {
    console.error("Error clearing notification group:", error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log("🧹 Cleared all notifications");
  } catch (error) {
    console.error("Error clearing all notifications:", error);
  }
};

/**
 * Get notification badge count
 */
export const getNotificationBadgeCount = async (): Promise<number> => {
  try {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  } catch (error) {
    console.error("Error getting badge count:", error);
    return 0;
  }
};

/**
 * Set notification badge count
 */
export const setNotificationBadgeCount = async (count: number) => {
  try {
    await Notifications.setBadgeCountAsync(count);
    console.log(`🔢 Set badge count to: ${count}`);
  } catch (error) {
    console.error("Error setting badge count:", error);
  }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking notification permissions:", error);
    return false;
  }
};

/**
 * Get all presented notifications
 */
export const getPresentedNotifications = async () => {
  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    console.log(`📱 Found ${notifications.length} presented notifications`);
    return notifications;
  } catch (error) {
    console.error("Error getting presented notifications:", error);
    return [];
  }
};
