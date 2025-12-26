import { create } from "zustand";

interface NotificationState {
  launchedFromNotification: any | null;
  isAppInForeground: boolean;
  setLaunchedFromNotification: (data: any | null) => void;
  clearLaunchedFromNotification: () => void;
  setAppInForeground: (isInForeground: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  launchedFromNotification: null,
  isAppInForeground: true, // Default to true since app starts in foreground
  setLaunchedFromNotification: (data) =>
    set({ launchedFromNotification: data }),
  clearLaunchedFromNotification: () => set({ launchedFromNotification: null }),
  setAppInForeground: (isInForeground) =>
    set({ isAppInForeground: isInForeground }),
}));
