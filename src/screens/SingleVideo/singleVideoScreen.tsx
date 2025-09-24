import { useRoute } from "@react-navigation/native";
import VideoItem from "../../components/VideoItem";
import ScreenWrapper from "../../components/ScreenWrapper";
import { dimensions } from "../../tools";
import { View } from "react-native";
import { commonStyles } from "../../styles/commonstyles";

const SingleVideoScreen = () => {
  const { params } = useRoute<any>(); // { video: IVideo }
  const video = params.video;

  return (
    <View style={[commonStyles.fullFlex]}>
      <VideoItem
        item={video}
        muted={false}
        mutedIcon={false}
        windowHeight={dimensions.height}
        setMuted={() => {}}
        setMutedIcon={() => {}}
        playAlways
        showDelete={false}
      />
    </View>
  );
};

export default SingleVideoScreen;
