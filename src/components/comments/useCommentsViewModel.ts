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
  createdBy?: string;
  by: string;
  createdAt?: string;
  date?: Date;
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
  subtask?: string,
  setCount?: (count: number) => void
) {
  const { user } = useAuthStore();
  const { formatDate, triggerVibration } = useHelper();

  const [initialLoading, setInitialLoading] = useState(true);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const flatListRef = useRef<FlatList<IComment>>(null);
  const fetchingRef = useRef(false);

  // Fetch comments
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (visible && fetchUrl) {
      fetchComments();
      if (autoRefresh) interval = setInterval(fetchComments, refreshInterval);
    }
    return () => clearInterval(Number(interval));
  }, [visible, fetchUrl, subtask]);

  // Scroll to end on new comments
  useEffect(() => {
    if (comments.length > 0)
      flatListRef.current?.scrollToEnd({ animated: true });
  }, [comments]);

  const fetchComments = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const res = await (await fetch(fetchUrl)).json();
      const data = Array.isArray(res) ? res : res?.comments ?? [];
      setComments(data);
      if (setCount) setCount(data.length);
    } catch (err) {
      console.error("fetchComments error:", err);
    } finally {
      fetchingRef.current = false;
      setInitialLoading(false);
    }
  };

  const handleAddComment = async (image?: string) => {
    if (!user?.userId || addingComment) return;
    setAddingComment(true);

    try {
      const body = subtask?.length
        ? {
            taskId: entityId,
            subtaskId: subtask,
            userId: user.userId,
            text: newComment.trim(),
            image,
          }
        : {
            createdBy: user.userId,
            by: user.userId,
            entityId,
            text: newComment.trim(),
            image,
          };

      const res = await ApiService.getApiResponse(
        postUrl,
        HttpMethods.POST,
        body
      );

      let updatedComments: IComment[] = [];
      if (subtask && res?.subtasks) {
        updatedComments = [
          ...(res.subtasks.find((t: Subtask) => t._id === subtask)?.comments ??
            []),
        ];
      } else if (res?.comments) {
        updatedComments = [...res.comments];
      }

      setComments(updatedComments);
      if (setCount) setCount(updatedComments.length);
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
