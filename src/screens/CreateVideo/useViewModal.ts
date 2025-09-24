import { useEffect, useState } from "react";
import { useHelper } from "../../utils/helper";
import { VideoRepo } from "../../repositories/videos";

export const useCreateVideoViewModal = () => {
  const [videosList, setVideosList] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const { loggedInUser } = useHelper();

  const getAllVideosList = async () => {
    try {
      setLoadingVideos(true);
      const data = await VideoRepo.getAllVideosList(loggedInUser?.userId!);
      setVideosList(data.videos);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    getAllVideosList();
  }, [loggedInUser?.userId]);

  return { videosList, loadingVideos };
};
