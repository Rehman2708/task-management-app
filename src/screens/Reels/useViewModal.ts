import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoRepo } from "../../repositories/videos";
import { dimensions } from "../../tools";
import { IVideo } from "../../types/videos";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";

export const useReelsViewModal = () => {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [mutedIcon, setMutedIcon] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const insets = useSafeAreaInsets();
  const windowHeight = dimensions.height - 86;
  // inside your component
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = useCallback(async (page: number = 1, append = false) => {
    try {
      page === 1 ? setLoading(true) : setIsFetchingMore(true);
      setError(null);
      if (!user?.userId) return;

      const response = await VideoRepo.getAllVideos({
        ownerUserId: user.userId,
        page,
        pageSize: 20,
      });
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setVideos((prev) =>
        append ? [...prev, ...response.videos] : response.videos
      );
    } catch (err: any) {
      console.error("Fetch videos error:", err);
      setError(err.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const success = await VideoRepo.deleteVideo(id);
      if (success) {
        setVideos((prev) => prev.filter((video) => video._id !== id));
      }
    } catch (err) {
      console.error("Delete video error:", err);
      Alert.alert("Error", "Failed to delete the video. Please try again.");
    }
  }, []);

  const deleteVideo = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete Video",
        "Are you sure you want to delete this video?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDelete(id),
          },
        ]
      );
    },
    [handleDelete]
  );
  const onRefresh = async () => {
    if (videos.length === 0) return;

    setRefreshing(true);
    await fetchVideos(1, false); // reset and fetch first page
    setRefreshing(false);
  };
  return {
    insets,
    fetchVideos,
    videos,
    loading,
    setCurrentIndex,
    currentIndex,
    muted,
    windowHeight,
    error,
    setMuted,
    mutedIcon,
    setMutedIcon,
    currentPage,
    totalPages,
    isFetchingMore,
    deleteVideo,
    refreshing,
    onRefresh,
  };
};
