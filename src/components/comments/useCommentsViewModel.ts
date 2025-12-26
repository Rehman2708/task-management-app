import { useEffect, useRef, useState } from "react";
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
  loading?: boolean; // ← NEW (optimistic bubble)
  failed?: boolean; // ← NEW (API failed)
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

  const fetchingRef = useRef(false);

  // Fetch comments with optimized intervals
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (visible && fetchUrl) {
      fetchComments();
      if (autoRefresh) {
        // Use shorter interval for active modal, longer for background
        const activeInterval = Math.min(refreshInterval, 3000); // Max 3 seconds when active
        interval = setInterval(fetchComments, activeInterval);
      }
    }
    return () => clearInterval(Number(interval));
  }, [visible, fetchUrl, subtask, refreshInterval]);

  // No need for manual scrolling with inverted FlatList

  const fetchComments = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const res = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const comments = Array.isArray(data) ? data : data?.comments ?? [];

      // Only update if comments actually changed (avoid unnecessary re-renders)
      setComments((prevComments) => {
        const hasChanged =
          JSON.stringify(prevComments) !== JSON.stringify(comments);
        return hasChanged ? comments : prevComments;
      });

      if (setCount) setCount(comments.length);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("fetchComments error:", err);
      }
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
      setInitialLoading(false);
    }
  };

  const handleAddComment = async (image?: string) => {
    if (!user?.userId || addingComment) return;

    const trimmed = newComment.trim();
    if (!trimmed && !image) return;

    // Clear input immediately for instant feedback
    setNewComment("");
    setAddingComment(true);

    // ★ OPTIMISTIC COMMENT - Show instantly
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempComment: IComment = {
      _id: tempId,
      text: trimmed,
      image,
      by: user.userId,
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
      createdByDetails: { name: user.name, image: user.image },
      loading: false, // Show as normal comment, not loading
    };

    // Add optimistic comment immediately
    setComments((prev) => [...prev, tempComment]);

    // Update count immediately
    if (setCount) setCount(comments.length + 1);

    try {
      const body = subtask?.length
        ? {
            taskId: entityId,
            subtaskId: subtask,
            userId: user.userId,
            text: trimmed,
            image,
          }
        : {
            createdBy: user.userId,
            by: user.userId,
            entityId,
            text: trimmed,
            image,
          };

      const res = await ApiService.getApiResponse(
        postUrl,
        HttpMethods.POST,
        body
      );

      // Replace optimistic comment with server response
      if (res) {
        let serverComment: IComment | null = null;

        if (subtask && res?.subtasks) {
          const subtaskData = res.subtasks.find(
            (t: Subtask) => t._id === subtask
          );
          if (subtaskData?.comments?.length) {
            serverComment =
              subtaskData.comments[subtaskData.comments.length - 1];
          }
        } else if (res?.comments?.length) {
          serverComment = res.comments[res.comments.length - 1];
        }

        if (serverComment) {
          setComments((prev) =>
            prev.map((c) => (c._id === tempId ? serverComment! : c))
          );
        }
      }
    } catch (err) {
      console.error("addComment error:", err);

      // Mark temp comment as failed with retry option
      setComments((prev) =>
        prev.map((c) =>
          c._id === tempId ? { ...c, failed: true, loading: false } : c
        )
      );

      // Revert count on failure
      if (setCount) setCount(Math.max(0, comments.length));
    } finally {
      triggerVibration("medium");
      setAddingComment(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    addingComment,
    handleAddComment,
    formatDate,
    isFetching,
    initialLoading,
  };
}
