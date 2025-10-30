import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

async function ensurePermission() {
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
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

async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;

  // Define your channels
  const channels = [
    {
      id: "note",
      name: "Notes",
      sound: "notification.wav", // must exist in your assets folder (if used)
      importance: Notifications.AndroidImportance.DEFAULT,
    },
    {
      id: "task",
      name: "Tasks",
      sound: "notification.wav",
      importance: Notifications.AndroidImportance.HIGH,
    },
    {
      id: "video",
      name: "Videos",
      sound: "notification.wav",
      importance: Notifications.AndroidImportance.HIGH,
    },
    {
      id: "profile",
      name: "Profile Updates",
      sound: "notification.wav",
      importance: Notifications.AndroidImportance.DEFAULT,
    },
    {
      id: "list",
      name: "List",
      sound: "notification.wav",
      importance: Notifications.AndroidImportance.DEFAULT,
    },
  ];

  // Create each channel
  for (const channel of channels) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      importance: channel.importance,
      sound: channel.sound,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  console.log("✅ Android notification channels set up");
}

export async function registerForPushNotificationsAsync() {
  const hasPermission = await ensurePermission();
  if (!hasPermission) return null;

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "9018bc69-22dd-4d27-8d53-4fd7da4e3ca0",
    })
  ).data;

  await setupAndroidChannel();
  return token;
}

export async function getNotificationPermission() {
  const hasPermission = await ensurePermission();
  if (!hasPermission) return null;

  await setupAndroidChannel();
  return true;
}
