import { useEffect, useRef, useState } from "react";
import { Keyboard, FlatList } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useHelper } from "../../utils/helper";
import { Subtask } from "../../types/task";
import { ApiService } from "../../data/network/apiservices";
import { HttpMethods } from "../../data/network/httpMethods";

export interface IComment {
  _id?: string;
  text?: string;
  image?: string;
  createdBy: string;
  by: string;
  createdAt?: string;
  createdByDetails?: {
    name?: string;
    image?: string;
  };
}

export function useCommentsViewModel(
  fetchUrl: string,
  postUrl: string,
  entityId: string,
  visible: boolean,
  autoRefresh: boolean = true,
  refreshInterval: number = 5000,
  subtask: string | undefined,
  setCount: ((count: number) => void) | undefined
) {
  const { user } = useAuthStore();
  const { formatDate, triggerVibration } = useHelper();
  const [initialLoading, setInitialLoading] = useState(true);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const flatListRef = useRef<FlatList<IComment>>(null);

  // Fetch comments initially and set interval if needed
  useEffect(() => {
    setComments([]);
    let interval: NodeJS.Timer;
    if (visible && fetchUrl) {
      fetchComments();
      if (autoRefresh) {
        interval = setInterval(fetchComments, refreshInterval);
      }
    }
    return () => clearInterval(Number(interval));
  }, [visible, fetchUrl, subtask]);
  useEffect(() => {
    if (comments.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [comments]);

  const fetchingRef = useRef(false);

  const fetchComments = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await fetch(fetchUrl);
      const res = await response.json();

      if (Array.isArray(res)) {
        setComments(res);
        if (setCount) setCount(res.length ?? 0);
      } else if (res?.comments) {
        setComments(res.comments);
        if (setCount) setCount(res.comments.length ?? 0);
      }
    } catch (err) {
      console.error("fetchComments error:", err);
    } finally {
      fetchingRef.current = false;
      setInitialLoading(false); // ✅ only affects first load
    }
  };

  const handleAddComment = async (image?: string) => {
    if (!user?.userId || addingComment) return;

    // Keyboard.dismiss();
    setAddingComment(true);

    try {
      const body = subtask?.length
        ? {
            taskId: entityId,
            subtaskId: subtask,
            userId: user.userId,
            text: newComment.trim(),
            image: image ?? undefined,
          }
        : {
            createdBy: user.userId,
            by: user.userId,
            text: newComment.trim(),
            entityId,
            image: image ?? undefined,
          };
      const res = await ApiService.getApiResponse(
        postUrl,
        HttpMethods.POST,
        body
      );

      if (subtask && res?.subtasks) {
        const comments = [
          ...res.subtasks.find((item: Subtask) => item._id === subtask)
            .comments,
        ];
        setComments(comments);
        if (setCount) setCount(comments.length ?? 0);
      } else if (res?.comments) {
        setComments([...res.comments]);
        if (setCount) setCount([...res.comments].length ?? 0);
      }
    } catch (err) {
      console.error("addComment error:", err);
    } finally {
      triggerVibration("medium");
      setNewComment("");
      setAddingComment(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    addingComment,
    handleAddComment,
    flatListRef,
    formatDate,
    isFetching,
    initialLoading,
  };
}
