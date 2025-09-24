import { create } from "zustand";
import {
  clearAsyncStorage,
  storeDataInAsyncStorage,
} from "../utils/localstorage";
import { IUser } from "../types/auth";
import { LocalStorageKey } from "../enums/localstorage";

interface AuthStateType {
  user: IUser | null;
  updateUser: (user: IUser | null) => void;
  logout: () => Promise<void>;
}
export const useAuthStore = create<AuthStateType>((set) => {
  return {
    user: null,
    logout: async () => {
      await clearAsyncStorage();
      set({ user: null });
    },
    updateUser: (user: IUser | null) => {
      if (user) {
        storeDataInAsyncStorage(LocalStorageKey.USER, user);
      }

      set({ user });
    },
  };
});
