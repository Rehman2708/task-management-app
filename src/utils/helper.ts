import { useEffect, useState } from "react";
import { getDataFromAsyncStorage } from "./localstorage";
import { IUser } from "../types/auth";
import { LocalStorageKey } from "../enums/localstorage";
import { theme } from "../infrastructure/theme";
import { Priority } from "../enums/tasks";

export function useHelper() {
  const [loggedInUser, setLoggedInUser] = useState<IUser | null>(null);
  const [gettingUser, setGettingUser] = useState<boolean>(true);
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
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getDataFromAsyncStorage<IUser>(
          LocalStorageKey.USER
        );
        setLoggedInUser(data);
      } catch (err) {
        console.error("Error fetching user from storage:", err);
      } finally {
        setGettingUser(false);
      }
    };

    fetchThemeColor();
    fetchUser();
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

  return {
    loggedInUser,
    gettingUser,
    getInitials,
    fetchThemeColor,
    themeColor,
    formatDate,
    getPriorityColor,
  };
}
