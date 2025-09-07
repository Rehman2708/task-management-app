import { useEffect, useState } from "react";
import { getDataFromAsyncStorage } from "./localstorage";
import { IUser } from "../types/auth";
import { LocalStorageKey } from "../enums/localstorage";

export function useHelper() {
  const [loggedInUser, setLoggedInUser] = useState<IUser | null>(null);
  const [gettingUser, setGettingUser] = useState<boolean>(true);

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
  return { loggedInUser, gettingUser, getInitials };
}
