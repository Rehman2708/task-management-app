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
    // Helper function to create comment category actions
    const createCommentActions = (
      viewIdentifier: string,
      viewTitle: string
    ) => [
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
        identifier: viewIdentifier,
        buttonTitle: viewTitle,
        options: {
          opensAppToForeground: true,
        },
      },
    ];

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

    // Comment categories with consistent structure
    const commentCategories = [
      { id: "comment", viewId: "view", viewTitle: "View" },
      { id: "task_comment", viewId: "view_task", viewTitle: "View Task" },
      { id: "note_comment", viewId: "view_note", viewTitle: "View Note" },
      { id: "list_comment", viewId: "view_list", viewTitle: "View List" },
      { id: "video_comment", viewId: "view_video", viewTitle: "View Video" },
    ];

    for (const category of commentCategories) {
      await Notifications.setNotificationCategoryAsync(
        category.id,
        createCommentActions(category.viewId, category.viewTitle)
      );
    }

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

    console.log("📱 Setting up notification channels and categories...");
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

export const handleNotificationNavigation = async (data?: any) => {
  if (!data) return;

  // Log grouped notification info for debugging
  if (data.isGrouped && data.commentCount) {
    console.log(
      `📱 Opening grouped notification with ${data.commentCount} comments`
    );
  }

  // Clear related notifications when opening the item
  const { clearCommentNotifications, clearNotificationGroup } = await import(
    "./src/utils/notificationHelpers"
  );

  switch (data.type) {
    case "note":
      if (data.noteId) {
        if (data.isComment || data.isGrouped) {
          await clearCommentNotifications(data.noteId, "note");
        }
        navigate(ROUTES.VIEW_NOTE, {
          noteId: data.noteId,
          showComments: data.isComment || data.isGrouped,
        });
      } else {
        navigate(ROUTES.NOTES);
      }
      break;

    case "list":
      if (data.listId) {
        if (data.isComment || data.isGrouped) {
          await clearCommentNotifications(data.listId, "list");
        }
        navigate(ROUTES.VIEW_LIST, {
          listId: data.listId,
          showComments: data.isComment || data.isGrouped,
        });
      } else {
        navigate(ROUTES.LISTS);
      }
      break;

    case "task":
      if (data.taskId) {
        if (data.isComment || data.isGrouped) {
          await clearCommentNotifications(data.taskId, "task");
        }
        navigate(ROUTES.TASK_DETAIL, {
          taskId: data.taskId,
          readOnly: !data.isActive,
          showComments: data.isComment || data.isGrouped,
          commentSubtaskId: data.commentSubtaskId,
        });
      } else {
        navigate(ROUTES.TASKS);
      }
      break;

    case "subtask_reminder":
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

    case "profile":
      navigate(ROUTES.PROFILE);
      break;

    case "video":
      if (data.videoData) {
        if (data.isComment || data.isGrouped) {
          await clearCommentNotifications(data.videoData.id, "video");
        }
        navigate(ROUTES.SINGLE_VIDEO, {
          video: data.videoData,
          showComments: data.isComment || data.isGrouped,
        });
      } else {
        navigate(ROUTES.REELS);
      }
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
    const { showSuccessNotification } = await import(
      "./src/utils/notificationUtils"
    );
    await showSuccessNotification(
      "✅ Subtask Completed!",
      "Great job! The subtask has been marked as completed."
    );
  } catch (error) {
    console.error("Error completing subtask:", error);

    // Show error notification
    const { showErrorNotification } = await import(
      "./src/utils/notificationUtils"
    );
    await showErrorNotification(
      "❌ Error",
      "Failed to mark subtask as completed. Please try again."
    );
  }
};

// Handle comment reply from notification action
export const handleCommentReply = async (
  commentText: string,
  notificationData: any,
  userId: string
) => {
  console.log("📱 handleCommentReply called with:", {
    commentText: commentText?.substring(0, 50) + "...",
    type: notificationData?.type,
    userId,
    hasTaskId: !!notificationData?.taskId,
    hasNoteId: !!notificationData?.noteId,
    hasListId: !!notificationData?.listId,
    hasVideoData: !!notificationData?.videoData,
  });

  if (!commentText?.trim() || !userId) {
    console.warn("❌ Invalid comment reply data:", {
      commentText: !!commentText,
      userId: !!userId,
    });
    return;
  }

  try {
    const { type, taskId, noteId, listId, videoData, commentSubtaskId } =
      notificationData;

    let success = false;
    let successMessage = "";

    console.log("📱 Processing comment reply for type:", type);

    switch (type) {
      case "task":
        if (taskId) {
          console.log("📱 Adding task comment:", { taskId, commentSubtaskId });
          const { TaskRepo } = await import("./src/repositories/task");

          if (commentSubtaskId) {
            // Reply to subtask comment
            console.log("📱 Adding subtask comment");
            await TaskRepo.addSubtaskComment(taskId, commentSubtaskId, {
              userId: userId,
              text: commentText.trim(),
            });
            successMessage = "Reply sent to subtask!";
          } else {
            // Reply to task comment
            console.log("📱 Adding task comment");
            await TaskRepo.addTaskComment(taskId, {
              by: userId,
              text: commentText.trim(),
            });
            successMessage = "Reply sent to task!";
          }
          success = true;
        } else {
          console.warn("❌ No taskId provided for task comment");
        }
        break;

      case "note":
        if (noteId) {
          console.log("📱 Adding note comment:", { noteId });
          const { NotesRepo } = await import("./src/repositories/notes");
          await NotesRepo.addNoteComment(noteId, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to note!";
        } else {
          console.warn("❌ No noteId provided for note comment");
        }
        break;

      case "list":
        if (listId) {
          console.log("📱 Adding list comment:", { listId });
          const { ListsRepo } = await import("./src/repositories/lists");
          await ListsRepo.addListComment(listId, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to list!";
        } else {
          console.warn("❌ No listId provided for list comment");
        }
        break;

      case "video":
        if (videoData?.id) {
          console.log("📱 Adding video comment:", { videoId: videoData.id });
          const { VideoRepo } = await import("./src/repositories/videos");
          await VideoRepo.addVideoComment(videoData.id, {
            createdBy: userId,
            text: commentText.trim(),
          });
          success = true;
          successMessage = "Reply sent to video!";
        } else {
          console.warn("❌ No videoData.id provided for video comment");
        }
        break;

      default:
        throw new Error(`Unsupported comment type: ${type}`);
    }

    if (success) {
      console.log("✅ Comment reply successful:", successMessage);
      // Show success notification
      const { showSuccessNotification } = await import(
        "./src/utils/notificationUtils"
      );
      await showSuccessNotification("💬 Reply Sent!", successMessage);
    } else {
      console.warn("❌ Comment reply failed - no success flag set");
      throw new Error("Failed to process reply");
    }
  } catch (error) {
    console.error("❌ Error sending comment reply:", error);

    // Show error notification
    const { showErrorNotification } = await import(
      "./src/utils/notificationUtils"
    );
    await showErrorNotification(
      "❌ Error",
      "Failed to send reply. Please try again."
    );
  }
};
