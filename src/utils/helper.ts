import { useState } from "react";
import { Priority } from "../enums/tasks";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../infrastructure/theme";
import { Vibration } from "react-native";
import { isAndroid } from "../tools";

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

  const triggerVibration = (type: "light" | "medium" | "heavy" = "light") => {
    Vibration.vibrate(type === "medium" ? 50 : type === "heavy" ? 100 : 15);
  };

  return {
    loggedInUser,
    getInitials,
    themeColor,
    formatDate,
    getPriorityColor,
    triggerVibration,
  };
}
