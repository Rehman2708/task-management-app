import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUtilStore } from "../../store/utils";
import { List, ListsRepo } from "../../repositories/lists";
import { useNavigation } from "@react-navigation/native";

export function useViewListViewModel(listId?: string) {
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [showPinAlert, setShowPinAlert] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { refetchLists } = useUtilStore();
  const [totalComments, setTotalComments] = useState(
    list?.comments?.length ?? 0,
  );
  const getList = async () => {
    if (!listId) return;
    try {
      setLoading(true);
      const data = await ListsRepo.getSingleList(listId);
      setList(data);
      setPinned(data?.pinned ?? false);
      setTotalComments(data?.comments?.length ?? 0);
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

  const handlePinUnpinList = async () => {
    try {
      setLoading(true);
      await ListsRepo.pinList(listId ?? "", !pinned, user?.userId ?? "");
      getList();
      refetchLists();
    } catch (err: any) {
    } finally {
      setLoading(false);
      setShowPinAlert(false);
    }
  };

  const toggleItemCompletion = async (index: number) => {
    if (!list) return;

    const updatedItems = [...(list.items || [])];
    updatedItems[index].completed = !updatedItems[index].completed;
    setList({ ...list, items: updatedItems });

    (async () => {
      try {
        await ListsRepo.updateList(list._id, {
          title: list.title,
          description: list.description,
          items: updatedItems,
          image: list.image ?? undefined,
          userId: user?.userId ?? "",
        });
      } catch (err: any) {
        console.error("Toggle completion error:", err);
        setError(err.message || "Failed to update list");
        setList((prev) => {
          if (!prev) return prev;
          const revert = [...prev.items];
          revert[index].completed = !revert[index].completed;
          return { ...prev, items: revert };
        });
      }
    })();
  };

  useEffect(() => {
    getList();
  }, [listId]);

  return {
    list,
    loading,
    updating,
    error,
    deleteList,
    toggleItemCompletion,
    refetch: getList,
    totalComments,
    setTotalComments,
    pinned,
    showPinAlert,
    setShowPinAlert,
    handlePinUnpinList,
  };
}
