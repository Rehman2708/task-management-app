import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { VideoRepo } from "../../repositories/videos";

export const useCreateVideoViewModal = () => {
  const [videosList, setVideosList] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuthStore();

  const fetchVideos = useCallback(
    async (page: number = 1, append = false) => {
      if (!user?.userId) return;

      try {
        if (page === 1) {
          setLoadingVideos(true);
        } else {
          setIsFetchingMore(true);
        }

        const response = await VideoRepo.getAllVideos({
          ownerUserId: user.userId,
          page,
          pageSize: 30,
        });
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);

        setVideosList((prev) =>
          append ? [...prev, ...response.videos] : response.videos
        );
      } catch (err) {
        console.error("Fetch videos error:", err);
      } finally {
        setLoadingVideos(false);
        setIsFetchingMore(false);
      }
    },
    [user?.userId] // ✅ depend on userId
  );

  // Refetch when user changes
  useEffect(() => {
    if (user?.userId) {
      setVideosList([]);
      setCurrentPage(1);
      setTotalPages(1);
      fetchVideos(1, false);
    }
  }, [user?.userId, fetchVideos]);

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      fetchVideos(currentPage + 1, true);
    }
  };

  return { videosList, loadingVideos, isFetchingMore, handleLoadMore };
};
