import { create } from "zustand";

interface AuthStateType {
  fetchingTask: boolean;
  refetchTask: () => void;
  fetchingHistory: boolean;
  refetchHistory: () => void;
  fetchingNotes: boolean;
  refetchNotes: () => void;
}

export const useUtilStore = create<AuthStateType>((set) => ({
  fetchingTask: false,
  refetchTask: () => set((state) => ({ fetchingTask: !state.fetchingTask })),

  fetchingHistory: false,
  refetchHistory: () =>
    set((state) => ({ fetchingHistory: !state.fetchingHistory })),

  fetchingNotes: false,
  refetchNotes: () => set((state) => ({ fetchingNotes: !state.fetchingNotes })),
}));
