import { create } from "zustand";

interface AuthStateType {
  fetchingTask: boolean;
  refetchTask: () => void;
  fetchingNotes: boolean;
  refetchNotes: () => void;
  fetchingLists: boolean;
  refetchLists: () => void;
}

export const useUtilStore = create<AuthStateType>((set) => ({
  fetchingTask: false,
  refetchTask: () => set((state) => ({ fetchingTask: !state.fetchingTask })),

  fetchingNotes: false,
  refetchNotes: () => set((state) => ({ fetchingNotes: !state.fetchingNotes })),

  fetchingLists: false,
  refetchLists: () => set((state) => ({ fetchingLists: !state.fetchingLists })),
}));
