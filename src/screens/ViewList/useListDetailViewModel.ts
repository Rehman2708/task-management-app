// src/features/lists/viewListViewModel.ts
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUtilStore } from "../../store/utils";
import { List, ListsRepo } from "../../repositories/lists";
import { useNavigation } from "@react-navigation/native";

export function useViewListViewModel(listId?: string) {
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { refetchLists, fetchingLists } = useUtilStore();

  const getList = async () => {
    try {
      setLoading(true);
      const data = await ListsRepo.getSingleList(listId!);
      setList(data);
    } catch (err: any) {
      console.error("Get list error:", err);
      setError(err.message || "Failed to fetch list");
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async () => {
    if (!list?._id) return;
    try {
      setUpdating(true);
      await ListsRepo.deleteList(list._id, user?.userId ?? "");
      refetchLists();
      navigation.goBack();
    } catch (err: any) {
      console.error("Delete list error:", err);
      setError(err.message || "Failed to delete list");
    } finally {
      setUpdating(false);
    }
  };

  const toggleItemCompletion = async (index: number) => {
    if (!list) return;
    try {
      setUpdating(true);
      const updatedItems = [...(list.items || [])];
      updatedItems[index].completed = !updatedItems[index].completed;

      // Send updated list to backend
      const updated = await ListsRepo.updateList(list._id, {
        title: list.title,
        description: list.description,
        items: updatedItems,
        image: list.image ?? undefined,
        userId: user?.userId ?? "",
      });

      setList(updated);
      refetchLists();
    } catch (err: any) {
      console.error("Toggle completion error:", err);
      setError(err.message || "Failed to update list");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (listId) getList();
  }, [listId, fetchingLists]);

  return {
    list,
    loading,
    updating,
    error,
    deleteList,
    toggleItemCompletion,
    refetch: getList,
  };
}
