import { useState } from "react";
import { Priority } from "../enums/tasks";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../infrastructure/theme";
import { Vibration, Image } from "react-native";
import { isAndroid } from "../tools";

export function useHelper() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const [themeColor] = useState({
    light: user?.theme?.light ?? theme.colors.secondary,
    dark: user?.theme?.dark ?? theme.colors.primary,
  });

  const loggedInUser = user;

  function getInitials(name = "", returnFullFirstName = false) {
    if (!name || typeof name !== "string") return "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (returnFullFirstName) {
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1]}`.trim();
      }
      return parts[0];
    }
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];

    return (first + last).toUpperCase();
  }
  const formatDate = (date: string | Date, formatType = "both") => {
    if (!date) return "";

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
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const formattedDate = `${day} ${month} ${year}`;
    const formattedTime = `${hours}:${minutes}`;

    // TODAY / YESTERDAY LOGIC
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    let relativeText = formattedDate;
    if (isSameDay(d, today)) relativeText = "Today";
    else if (isSameDay(d, yesterday)) relativeText = "Yesterday";

    // FINAL FORMATS
    if (formatType === "date") {
      return relativeText;
    }

    if (formatType === "time") {
      return formattedTime;
    }

    // formatType === "both"
    return `${relativeText}, ${formattedTime}`;
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

  const getImageSize = (
    url: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        url,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  };

  return {
    loggedInUser,
    getInitials,
    themeColor,
    formatDate,
    getPriorityColor,
    triggerVibration,
    getImageSize,
  };
}
