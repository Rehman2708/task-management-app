import { useEffect, useState } from "react";
import { useHelper } from "../../utils/helper";
import { VideoRepo } from "../../repositories/videos";

export const useCreateVideoViewModal = () => {
  const [videosList, setVideosList] = useState([]);
  const { loggedInUser } = useHelper();
  const getAllVideosList = async () => {
    try {
      const data = await VideoRepo.getAllVideosList(loggedInUser?.userId!);
      setVideosList(data.videos);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllVideosList();
  }, [loggedInUser?.userId]);
  return { videosList };
};
