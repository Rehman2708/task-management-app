import { useRoute } from "@react-navigation/native";
import VideoItem from "../../components/VideoItem";
import { dimensions } from "../../tools";
import { View } from "react-native";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";

const SingleVideoScreen = () => {
  const { params } = useRoute<any>(); // { video: IVideo }
  const video = params.video;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

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
        singleScreen
      />
    </View>
  );
};

export default SingleVideoScreen;
