import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { ROUTES } from "./src/enums/routes";
import { createNavigationContainerRef } from "@react-navigation/native";
import {
  NotificationData,
  NotificationCategory,
  NotificationAction,
  NotificationChannel,
} from "./src/enums/notifications";

export const navigationRef = createNavigationContainerRef();

export async function ensurePermission() {
  if (!Device.isDevice) {
    console.log("Must use a physical device for Push Notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    // Request permissions with action buttons support
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: true,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: true,
        allowProvisional: false,
        allowAnnouncements: false,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push notification permissions!");
    return null;
  }

  return finalStatus;
}

async function setupAndroidChannels() {
  if (Platform.OS !== "android") return;

  const channels = [
    {
      id: NotificationChannel.Note,
      name: "Notes",
      description: "Notifications for notes and note comments",
    },
    {
      id: NotificationChannel.Task,
      name: "Tasks",
      description: "Notifications for tasks and task comments",
    },
    {
      id: NotificationChannel.Video,
      name: "Videos",
      description: "Notifications for videos and video comments",
    },
    {
      id: NotificationChannel.Profile,
      name: "Profile Updates",
      description: "Notifications for profile and partner updates",
    },
    {
      id: NotificationChannel.List,
      name: "Lists",
      description: "Notifications for lists and list comments",
    },
    {
      id: NotificationChannel.SubtaskReminder,
      name: "Subtask Reminders",
      description: "Reminders for upcoming subtask due dates",
    },
    {
      id: NotificationChannel.CalendarEvent,
      name: "Calendar Events",
      description: "Daily reminders for upcoming calendar events",
    },
  ];

  for (const c of channels) {
    await Notifications.setNotificationChannelAsync(c.id, {
      name: c.name,
      description: c.description,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 50, 300, 100, 300],
      sound: "notification.wav",
      enableLights: true,
      lightColor: "#FF0000",
      enableVibrate: true,
      showBadge: true,
    });
  }
}

async function setupNotificationCategories() {
  try {
    // Helper function to create comment category actions
    const createCommentActions = (
      viewIdentifier: string,
      viewTitle: string,
    ) => [
      {
        identifier: NotificationAction.Reply,
        buttonTitle: "Reply",
        options: {
          opensAppToForeground: false,
          isDestructive: false,
        },
        textInput: {
          submitButtonTitle: "Send",
          placeholder: "Type your reply...",
        },
      },
      {
        identifier: viewIdentifier,
        buttonTitle: viewTitle,
        options: {
          opensAppToForeground: true,
        },
      },
    ];

    // Set up notification categories with action buttons
    await Notifications.setNotificationCategoryAsync(
      NotificationCategory.SubtaskReminder,
      [
        {
          identifier: NotificationAction.Complete,
          buttonTitle: "Mark Complete",
          options: {
            opensAppToForeground: false, // Action can be handled in background
          },
        },
        {
          identifier: NotificationAction.View,
          buttonTitle: "View Task",
          options: {
            opensAppToForeground: true,
          },
        },
      ],
    );

    // Comment categories with consistent structure
    const commentCategories = [
      {
        id: NotificationCategory.Comment,
        viewId: NotificationAction.View,
        viewTitle: "View",
      },
      {
        id: NotificationCategory.TaskComment,
        viewId: NotificationAction.ViewTask,
        viewTitle: "View Task",
      },
      {
        id: NotificationCategory.NoteComment,
        viewId: NotificationAction.ViewNote,
        viewTitle: "View Note",
      },
      {
        id: NotificationCategory.ListComment,
        viewId: NotificationAction.ViewList,
        viewTitle: "View List",
      },
      {
        id: NotificationCategory.VideoComment,
        viewId: NotificationAction.ViewVideo,
        viewTitle: "View Video",
      },
    ];

    for (const category of commentCategories) {
      await Notifications.setNotificationCategoryAsync(
        category.id,
        createCommentActions(category.viewId, category.viewTitle),
      );
    }
  } catch (error) {
    console.error("Failed to setup notification categories:", error);
  }
}

export async function getNotificationPermission() {
  try {
    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      return null;
    }

    // Set up channels and categories sequentially to ensure proper setup
    await setupAndroidChannels();
    await setupNotificationCategories();

    // Small delay to ensure everything is registered
    await new Promise((resolve) => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error("Failed to setup notifications:", error);
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  const hasPermission = await getNotificationPermission();
  if (!hasPermission) return null;

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "9018bc69-22dd-4d27-8d53-4fd7da4e3ca0",
    })
  ).data;

  return token;
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

// Helper function to check if user is on the target screen for the same item
const isOnTargetScreen = (targetRoute: string, targetParams: any): boolean => {
  if (!navigationRef.isReady()) return false;

  const currentState = navigationRef.getState();
  const currentRoute = currentState?.routes?.[currentState.index];

  if (!currentRoute || currentRoute.name !== targetRoute) return false;

  // Check if the params match for the same item
  const currentParams = currentRoute.params as any;

  switch (targetRoute) {
    case ROUTES.VIEW_NOTE:
      return currentParams?.noteId === targetParams?.noteId;
    case ROUTES.VIEW_LIST:
      return currentParams?.listId === targetParams?.listId;
    case ROUTES.TASK_DETAIL:
      return currentParams?.taskId === targetParams?.taskId;
    case ROUTES.SINGLE_VIDEO:
      return currentParams?.video?._id === targetParams?.video?._id;
    default:
      return false;
  }
};

// Helper function to trigger comment modal on current screen
const triggerCommentModal = (data: any) => {
  // Import DeviceEventEmitter for cross-component communication
  const { DeviceEventEmitter } = require("react-native");

  // Emit event to open comment modal on current screen
  DeviceEventEmitter.emit("openCommentModal", {
    isComment: data.isComment,
    isGrouped: data.isGrouped,
    commentSubtaskId: data.commentSubtaskId,
  });
};

export const handleNotificationNavigation = async (data?: any) => {
  if (!data) return;

  try {
    // Import notification helpers
    const notificationHelpers = await import("./src/utils/notificationHelpers");
    const { clearCommentNotifications, clearNotificationGroup } =
      notificationHelpers;

    switch (data.type) {
      case NotificationData.Note:
        if (data.noteId) {
          if (data.isComment || data.isGrouped) {
            await clearCommentNotifications(data.noteId, "note");
          }

          const noteParams = {
            noteId: data.noteId,
            showComments: data.isComment || data.isGrouped,
          };

          // Check if user is already on the same note screen
          if (
            (data.isComment || data.isGrouped) &&
            isOnTargetScreen(ROUTES.VIEW_NOTE, noteParams)
          ) {
            triggerCommentModal(data);
          } else {
            navigate(ROUTES.VIEW_NOTE, noteParams);
          }
        } else {
          navigate(ROUTES.NOTES);
        }
        break;

      case NotificationData.List:
        if (data.listId) {
          if (data.isComment || data.isGrouped) {
            await clearCommentNotifications(data.listId, "list");
          }

          const listParams = {
            listId: data.listId,
            showComments: data.isComment || data.isGrouped,
          };

          // Check if user is already on the same list screen
          if (
            (data.isComment || data.isGrouped) &&
            isOnTargetScreen(ROUTES.VIEW_LIST, listParams)
          ) {
            triggerCommentModal(data);
          } else {
            navigate(ROUTES.VIEW_LIST, listParams);
          }
        } else {
          navigate(ROUTES.LISTS);
        }
        break;

      case NotificationData.Task:
        if (data.taskId) {
          if (data.isComment || data.isGrouped) {
            await clearCommentNotifications(data.taskId, "task");
          }

          const taskParams = {
            taskId: data.taskId,
            readOnly: !data.isActive,
            showComments: data.isComment || data.isGrouped,
            commentSubtaskId: data.commentSubtaskId,
          };

          // Check if user is already on the same task screen
          if (
            (data.isComment || data.isGrouped) &&
            isOnTargetScreen(ROUTES.TASK_DETAIL, taskParams)
          ) {
            triggerCommentModal(data);
          } else {
            navigate(ROUTES.TASK_DETAIL, taskParams);
          }
        } else {
          navigate(ROUTES.TASKS);
        }
        break;

      case NotificationData.SubtaskReminder:
        if (data.taskId) {
          await clearNotificationGroup(data.taskId);
          navigate(ROUTES.TASK_DETAIL, {
            taskId: data.taskId,
            readOnly: false,
            commentSubtaskId: data.subtaskId,
          });
        } else {
          navigate(ROUTES.TASKS);
        }
        break;

      case NotificationData.Profile:
        navigate(ROUTES.PROFILE);
        break;

      case NotificationData.Video:
        if (data.videoData) {
          if (data.isComment || data.isGrouped) {
            await clearCommentNotifications(data.videoData.id, "video");
          }

          const videoParams = {
            video: data.videoData,
            showComments: data.isComment || data.isGrouped,
          };

          // Check if user is already on the same video screen
          if (
            (data.isComment || data.isGrouped) &&
            isOnTargetScreen(ROUTES.SINGLE_VIDEO, videoParams)
          ) {
            triggerCommentModal(data);
          } else {
            navigate(ROUTES.SINGLE_VIDEO, videoParams);
          }
        } else {
          navigate(ROUTES.REELS);
        }
        break;

      case NotificationData.CalendarEvent:
        // Navigate to calendar screen when calendar event notification is tapped
        navigate(ROUTES.CALENDAR);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Error handling notification navigation:", error);
  }
};

// Handle subtask completion from notification action
export const handleSubtaskCompletion = async (
  taskId: string,
  subtaskId: string,
  userId: string,
) => {
  // Validate input
  if (!taskId || !subtaskId || !userId) {
    console.warn("Invalid subtask completion data");
    return;
  }

  try {
    const { TaskRepo } = await import("./src/repositories/task");
    const { SubtaskStatus } = await import("./src/enums/tasks");

    await TaskRepo.updateSubtaskStatus(taskId, subtaskId, {
      userId,
      status: SubtaskStatus.Completed,
    });

    // Show success notification
    const { showSuccessNotification } =
      await import("./src/utils/notificationUtils");
    await showSuccessNotification(
      "✅ Subtask Completed!",
      "Great job! The subtask has been marked as completed.",
    );
  } catch (error) {
    console.error("Error completing subtask:", error);

    // Show error notification
    const { showErrorNotification } =
      await import("./src/utils/notificationUtils");
    await showErrorNotification(
      "❌ Error",
      "Failed to mark subtask as completed. Please try again.",
    );
  }
};

// Handle comment reply from notification action
export const handleCommentReply = async (
  commentText: string,
  notificationData: any,
  userId: string,
) => {
  if (!commentText?.trim() || !userId) {
    console.warn("Invalid comment reply data");
    return;
  }

  try {
    const { type, taskId, noteId, listId, videoData, commentSubtaskId } =
      notificationData;

    let success = false;
    let successMessage = "";

    switch (type) {
      case NotificationData.Task:
        if (taskId) {
          const { TaskRepo } = await import("./src/repositories/task");

          if (commentSubtaskId) {
            // Reply to subtask comment
            await TaskRepo.addSubtaskComment(taskId, commentSubtaskId, {
              userId: userId,
              text: commentText.trim(),
            });
            successMessage = "Reply sent to subtask!";
          } else {
            // Reply to task comment
            await TaskRepo.addTaskComment(taskId, {
              by: userId,
              text: commentText.trim(),
            });
            successMessage = "Reply sent to task!";
          }
          success = true;
        }
        break;

      case NotificationData.Note:
        if (noteId) {
          const { NotesRepo } = await import("./src/repositories/notes");
          await NotesRepo.addNoteComment(noteId, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to note!";
        }
        break;

      case NotificationData.List:
        if (listId) {
          const { ListsRepo } = await import("./src/repositories/lists");
          await ListsRepo.addListComment(listId, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to list!";
        }
        break;

      case NotificationData.Video:
        if (videoData?.id) {
          const { VideoRepo } = await import("./src/repositories/videos");
          await VideoRepo.addVideoComment(videoData.id, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to video!";
        }
        break;

      default:
        throw new Error(`Unsupported comment type: ${type}`);
    }

    if (success) {
      // Show success notification
      const { showSuccessNotification } =
        await import("./src/utils/notificationUtils");
      await showSuccessNotification("💬 Reply Sent!", successMessage);
    } else {
      throw new Error("Failed to process reply");
    }
  } catch (error) {
    console.error("Error sending comment reply:", error);

    // Show error notification
    const { showErrorNotification } =
      await import("./src/utils/notificationUtils");
    await showErrorNotification(
      "❌ Error",
      "Failed to send reply. Please try again.",
    );
  }
};
