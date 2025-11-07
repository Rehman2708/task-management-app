import { create } from "zustand";

interface NotificationState {
  launchedFromNotification: any | null;
  setLaunchedFromNotification: (data: any | null) => void;
  clearLaunchedFromNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  launchedFromNotification: null,
  setLaunchedFromNotification: (data) =>
    set({ launchedFromNotification: data }),
  clearLaunchedFromNotification: () => set({ launchedFromNotification: null }),
}));
