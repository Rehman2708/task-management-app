import { useRoute } from "@react-navigation/native";
import VideoItem from "../../components/VideoItem";
import { dimensions, Spacer } from "../../tools";
import { SafeAreaView, View } from "react-native";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { IVideo } from "../../types/videos";
import { VideoRepo } from "../../repositories/videos";
import EmptyState from "../../components/emptyState";
import { LoaderTypes } from "../../components/screenLoader";

const SingleVideoScreen = () => {
  const { params } = useRoute<any>(); // { video: IVideo }
  const videoId = params.video._id;
  const showComments = params.showComments;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<IVideo | undefined>(undefined);

  const fetchVideo = useCallback(async (page: number = 1, append = false) => {
    try {
      setLoading(true);
      if (videoId) {
        const response = await VideoRepo.getSingleVideo(videoId);
        setVideo(response.video);
      }
    } catch (err: any) {
      console.error("Fetch videos error:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchVideo();
  }, []);
  return (
    <View style={[commonStyles.fullFlex, { backgroundColor: "#0e0e0e" }]}>
      {!video ? (
        <>
          <EmptyState
            loading={loading}
            text={"⚠️ Something went wrong"}
            type={LoaderTypes.VideoScreen}
          />
          <Spacer size={18} />
        </>
      ) : (
        <VideoItem
          item={video}
          muted={false}
          mutedIcon={false}
          windowHeight={dimensions.height + insets.top}
          setMuted={() => {}}
          setMutedIcon={() => {}}
          playAlways
          showDelete={false}
          singleScreen
          showComments={showComments}
        />
      )}
    </View>
  );
};

export default SingleVideoScreen;
