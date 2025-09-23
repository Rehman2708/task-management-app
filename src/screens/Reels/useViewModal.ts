import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocalStorageKey } from "../../enums/localstorage";
import { VideoRepo } from "../../repositories/videos";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { dimensions } from "../../tools";
import { IVideo } from "../../types/videos";

export const useReelsViewModal = () => {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [mutedIcon, setMutedIcon] = useState(false);

  const insets = useSafeAreaInsets();
  const windowHeight = dimensions.height - 90;

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await getDataFromAsyncStorage<{ userId: string }>(
        LocalStorageKey.USER
      );
      if (!data?.userId) return;

      const response: any = await VideoRepo.getAllVideos({
        ownerUserId: data.userId,
        page: 1,
        pageSize: 10,
      });
      setVideos(response.videos || []);
    } catch (err: any) {
      console.error("Fetch videos error:", err);
      setError(err.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

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
  };
};
