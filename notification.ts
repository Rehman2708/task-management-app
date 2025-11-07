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
    { id: "note", name: "Notes" },
    { id: "task", name: "Tasks" },
    { id: "video", name: "Videos" },
    { id: "profile", name: "Profile Updates" },
    { id: "list", name: "List" },
  ];

  for (const c of channels) {
    await Notifications.setNotificationChannelAsync(c.id, {
      name: c.name,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 50, 300, 100, 300],
      sound: "notification.wav",
    });
  }
}

export async function getNotificationPermission() {
  const hasPermission = await ensurePermission();
  if (!hasPermission) return null;
  await setupAndroidChannels();
  return true;
}

export async function registerForPushNotificationsAsync() {
  const hasPermission = await ensurePermission();
  if (!hasPermission) return null;

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "9018bc69-22dd-4d27-8d53-4fd7da4e3ca0",
    })
  ).data;

  await setupAndroidChannels();
  return token;
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log("⏳ Navigation not ready yet, storing for later");
  }
}

export const handleNotificationNavigation = (data?: any) => {
  if (!data) return;

  switch (data.type) {
    case "note":
      data.noteId
        ? navigate(ROUTES.VIEW_NOTE, { noteId: data.noteId })
        : navigate(ROUTES.NOTES);
      break;

    case "list":
      data.listId
        ? navigate(ROUTES.VIEW_LIST, { listId: data.listId })
        : navigate(ROUTES.LISTS);
      break;

    case "task":
      data.taskId
        ? navigate(ROUTES.TASK_DETAIL, {
            taskId: data.taskId,
            readOnly: !data.isActive,
            showComments: data.isComment,
            commentSubtaskId: data.commentSubtaskId,
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
            showComments: data.isComment,
          })
        : navigate(ROUTES.REELS);
      break;

    default:
      console.log("Unhandled notification type:", data.type);
      break;
  }
};
