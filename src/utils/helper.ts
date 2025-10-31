import { useState } from "react";
import { Priority } from "../enums/tasks";
import { useAuthStore } from "../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../enums/routes";
import { useTheme } from "../infrastructure/theme";

export function useHelper() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const [themeColor] = useState({
    light: user?.theme?.light ?? theme.colors.secondary,
    dark: user?.theme?.dark ?? theme.colors.primary,
  });

  const loggedInUser = user;

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
        if (notData.noteId) {
          navigation.navigate(ROUTES.VIEW_NOTE, { noteId: notData.noteId });
        } else {
          navigation.navigate(ROUTES.NOTES);
        }
        break;
      case "list":
        if (notData.listId) {
          navigation.navigate(ROUTES.VIEW_LIST, { listId: notData.listId });
        } else {
          navigation.navigate(ROUTES.LISTS);
        }
        break;
      case "task":
        if (notData.taskId) {
          navigation.navigate(ROUTES.TASK_DETAIL, {
            taskId: notData.taskId,
            readOnly: !notData?.isActive,
            showComments: notData.isComment,
            commentSubtaskId: notData.commentSubtaskId,
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
            showComments: notData.isComment,
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
    themeColor,
    formatDate,
    getPriorityColor,
    handleNotificationNavigation,
  };
}
