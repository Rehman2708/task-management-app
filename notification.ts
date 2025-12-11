import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { ROUTES } from "./src/enums/routes";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export async function ensurePermission() {
  if (!Device.isDevice) {
    console.log("Must use a physical device for Push Notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
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
      id: "note",
      name: "Notes",
      description: "Notifications for notes and note comments",
    },
    {
      id: "task",
      name: "Tasks",
      description: "Notifications for tasks and task comments",
    },
    {
      id: "video",
      name: "Videos",
      description: "Notifications for videos and video comments",
    },
    {
      id: "profile",
      name: "Profile Updates",
      description: "Notifications for profile and partner updates",
    },
    {
      id: "list",
      name: "Lists",
      description: "Notifications for lists and list comments",
    },
    {
      id: "subtask_reminder",
      name: "Subtask Reminders",
      description: "Reminders for upcoming subtask due dates",
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
    // Set up notification categories with action buttons
    await Notifications.setNotificationCategoryAsync("subtask_reminder", [
      {
        identifier: "complete",
        buttonTitle: "Mark Complete",
        options: {
          opensAppToForeground: false, // Action can be handled in background
        },
      },
      {
        identifier: "view",
        buttonTitle: "View Task",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // Generic comment category (fallback)
    await Notifications.setNotificationCategoryAsync("comment", [
      {
        identifier: "reply",
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
        identifier: "view",
        buttonTitle: "View",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // Task comment category
    await Notifications.setNotificationCategoryAsync("task_comment", [
      {
        identifier: "reply",
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
        identifier: "view_task",
        buttonTitle: "View Task",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // Note comment category
    await Notifications.setNotificationCategoryAsync("note_comment", [
      {
        identifier: "reply",
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
        identifier: "view_note",
        buttonTitle: "View Note",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // List comment category
    await Notifications.setNotificationCategoryAsync("list_comment", [
      {
        identifier: "reply",
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
        identifier: "view_list",
        buttonTitle: "View List",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // Video comment category
    await Notifications.setNotificationCategoryAsync("video_comment", [
      {
        identifier: "reply",
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
        identifier: "view_video",
        buttonTitle: "View Video",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    console.log("✅ Notification categories setup completed");
  } catch (error) {
    console.error("❌ Failed to setup notification categories:", error);
  }
}

export async function getNotificationPermission() {
  try {
    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      console.log("❌ Notification permission denied");
      return null;
    }

    await Promise.all([setupAndroidChannels(), setupNotificationCategories()]);

    console.log("✅ Notification permissions and setup completed");
    return true;
  } catch (error) {
    console.error("❌ Failed to setup notifications:", error);
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
  } else {
    console.log("⏳ Navigation not ready yet, storing for later");
  }
}

export const handleNotificationNavigation = (data?: any) => {
  if (!data) return;

  // Log grouped notification info for debugging
  if (data.isGrouped && data.commentCount) {
    console.log(
      `📱 Opening grouped notification with ${data.commentCount} comments`
    );
  }

  switch (data.type) {
    case "note":
      data.noteId
        ? navigate(ROUTES.VIEW_NOTE, {
            noteId: data.noteId,
            showComments: data.isComment || data.isGrouped,
          })
        : navigate(ROUTES.NOTES);
      break;

    case "list":
      data.listId
        ? navigate(ROUTES.VIEW_LIST, {
            listId: data.listId,
            showComments: data.isComment || data.isGrouped,
          })
        : navigate(ROUTES.LISTS);
      break;

    case "task":
      data.taskId
        ? navigate(ROUTES.TASK_DETAIL, {
            taskId: data.taskId,
            readOnly: !data.isActive,
            showComments: data.isComment || data.isGrouped,
            commentSubtaskId: data.commentSubtaskId,
          })
        : navigate(ROUTES.TASKS);
      break;

    case "subtask_reminder":
      data.taskId
        ? navigate(ROUTES.TASK_DETAIL, {
            taskId: data.taskId,
            readOnly: false,
            commentSubtaskId: data.subtaskId,
          })
        : navigate(ROUTES.TASKS);
      break;

    case "profile":
      navigate(ROUTES.PROFILE);
      break;

    case "video":
      data.videoData
        ? navigate(ROUTES.SINGLE_VIDEO, {
            video: data.videoData,
            showComments: data.isComment || data.isGrouped,
          })
        : navigate(ROUTES.REELS);
      break;

    default:
      console.log("Unhandled notification type:", data.type);
      break;
  }
};

// Handle subtask completion from notification action
export const handleSubtaskCompletion = async (
  taskId: string,
  subtaskId: string,
  userId: string
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Subtask Completed!",
        body: "Great job! The subtask has been marked as completed.",
        data: { type: "success" },
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Error completing subtask:", error);

    // Show error notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Error",
        body: "Failed to mark subtask as completed. Please try again.",
        data: { type: "error" },
      },
      trigger: null,
    });
  }
};

// Handle comment reply from notification action
export const handleCommentReply = async (
  commentText: string,
  notificationData: any,
  userId: string
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
      case "task":
        if (taskId) {
          const { TaskRepo } = await import("./src/repositories/task");

          if (commentSubtaskId) {
            // Reply to subtask comment
            await TaskRepo.addSubtaskComment(taskId, commentSubtaskId, {
              by: userId,
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

      case "note":
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

      case "list":
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

      case "video":
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💬 Reply Sent!",
          body: successMessage,
          data: { type: "success" },
        },
        trigger: null,
      });
    } else {
      throw new Error("Failed to process reply");
    }
  } catch (error) {
    console.error("Error sending comment reply:", error);

    // Show error notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Error",
        body: "Failed to send reply. Please try again.",
        data: { type: "error" },
      },
      trigger: null,
    });
  }
};
