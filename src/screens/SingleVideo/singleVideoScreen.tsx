import { useRoute } from "@react-navigation/native";
import VideoItem from "../../components/VideoItem";
import { dimensions, Spacer } from "../../tools";
import { SafeAreaView, View } from "react-native";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SingleVideoScreen = () => {
  const { params } = useRoute<any>(); // { video: IVideo }
  const video = params.video;
  const showComments = params.showComments;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
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
    </View>
  );
};

export default SingleVideoScreen;
