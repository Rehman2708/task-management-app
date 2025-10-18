import { useEffect, useState } from "react";
import { getDataFromAsyncStorage } from "./localstorage";
import { LocalStorageKey } from "../enums/localstorage";
import { theme } from "../infrastructure/theme";
import { Priority } from "../enums/tasks";
import { useAuthStore } from "../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../enums/routes";

export function useHelper() {
  const { user } = useAuthStore();
  const [themeColor, setThemeColor] = useState({
    light: theme.colors.secondary,
    dark: theme.colors.primary,
  });
  const fetchThemeColor = async () => {
    try {
      const { data } = await getDataFromAsyncStorage(LocalStorageKey.COLOR);
      setThemeColor(
        data ?? {
          light: theme.colors.secondary,
          dark: theme.colors.primary,
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching color from storage:", err);
    } finally {
    }
  };
  const loggedInUser = user;
  useEffect(() => {
    fetchThemeColor();
  }, []);
  function getInitials(name = "") {
    if (!name || typeof name !== "string") return "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];

    return (first + last).toUpperCase();
  }
  const formatDate = (date: string | Date, formatType = "both") => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    const d = new Date(date);
    const day = d.getDate(); // Day of month
    const month = months[d.getMonth()]; // Month short name
    const year = String(d.getFullYear()).slice(-2); // Last 2 digits of year
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const formattedDate = `${day} ${month} ${year}`;
    const formattedTime = `${hours}:${minutes}`;
    if (!date) return "";
    if (formatType === "date") return formattedDate;
    if (formatType === "time") return formattedTime;
    if (formatType === "both") return `${formattedDate}, ${formattedTime}`;

    return formattedDate; // fallback
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors: Record<Priority, string> = {
      [Priority.Low]: "green",
      [Priority.High]: "orange",
      [Priority.Urgent]: "red",
    };
    return colors[priority] ?? "green";
  };

  // notificationHelper.js
  const navigation: any = useNavigation();
  const handleNotificationNavigation = (notData: any) => {
    if (!notData) return;

    switch (notData.type) {
      case "note":
        if (notData.noteData) {
          navigation.navigate(ROUTES.VIEW_NOTE, { note: notData.noteData });
        } else {
          navigation.navigate(ROUTES.NOTES);
        }
        break;

      case "task":
        if (notData.taskId) {
          navigation.navigate(ROUTES.TASK_DETAIL, {
            taskId: notData.taskId,
            readOnly: !notData?.isActive,
          });
        } else {
          navigation.navigate(ROUTES.TASKS);
        }
        break;

      case "profile":
        navigation.navigate(ROUTES.PROFILE);
        break;

      case "video":
        if (notData.videoData) {
          navigation.navigate(ROUTES.SINGLE_VIDEO, {
            video: notData.videoData,
          });
        } else {
          navigation.navigate(ROUTES.REELS);
        }
        break;

      default:
        break;
    }
  };

  return {
    loggedInUser,
    getInitials,
    fetchThemeColor,
    themeColor,
    formatDate,
    getPriorityColor,
    handleNotificationNavigation,
  };
}
