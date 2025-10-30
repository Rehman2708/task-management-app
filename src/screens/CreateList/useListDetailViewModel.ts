import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  CreateListPayload,
  List,
  ListsRepo,
  UpdateListPayload,
} from "../../repositories/lists";
import { useUtilStore } from "../../store/utils";
import { useNavigation } from "@react-navigation/native";

export function useListDetailViewModel(list?: List) {
  const { refetchLists } = useUtilStore();
  const navigation = useNavigation();
  const [title, setTitle] = useState(list?.title || "");
  const [description, setDescription] = useState(list?.description || "");
  const [image, setImage] = useState(list?.image || "");
  const [items, setItems] = useState<{ text: string; completed: boolean }[]>(
    list?.items || []
  );
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user: loggedInUser } = useAuthStore();

  useEffect(() => {
    if (list) {
      setTitle(list.title);
      setDescription(list.description);
      setImage(list.image ?? "");
      setItems(list.items ?? []);
    }
  }, [list]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([{ text: newItem.trim(), completed: false }, ...items]);
    setNewItem("");
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const saveList = async () => {
    if (!title.trim()) {
      setError("List title cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (list?._id) {
        const payload: UpdateListPayload = {
          title,
          description: description,
          image,
          items,
          userId: loggedInUser?.userId ?? "",
        };
        const updated = await ListsRepo.updateList(list._id, payload);
        setSuccess("List updated successfully");
        setItems(updated.items);
      } else {
        const payload: CreateListPayload = {
          title,
          description,
          image,
          createdBy: loggedInUser?.userId!,
          items,
        };
        const created = await ListsRepo.createList(payload);
        setSuccess("List created successfully");
        setItems(created.items);
      }
    } catch (err: any) {
      console.error("Save list error:", err);
      setError(err.message || "Failed to save list");
    } finally {
      refetchLists();
      navigation.goBack();
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    image,
    setImage,
    items,
    newItem,
    setNewItem,
    addItem,
    removeItem,
    loading,
    error,
    success,
    saveList,
  };
}
