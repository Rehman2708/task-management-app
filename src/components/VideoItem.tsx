import { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";

import { IVideo } from "../types/videos";
import Avatar from "./avatar";
import { Column, Row, Spacer } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { VideoRepo } from "../repositories/videos";
import { useTheme } from "../infrastructure/theme";
import ProgressBar from "./timeLeftProgress";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentsModal from "./comments/commentModal";
import { AppUrl } from "../utils/appUrl";

type Props = {
  item: IVideo;
  index?: number;
  currentIndex?: number;
  isFocused?: boolean;
  muted: boolean;
  mutedIcon: boolean;
  windowHeight: number;
  longPressedIndex?: number | null;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setMutedIcon: React.Dispatch<React.SetStateAction<boolean>>;
  setLongPressedIndex?: React.Dispatch<React.SetStateAction<number | null>>;
  deleteVideo?: (id: string) => void;
  showDelete?: boolean;
  singleScreen?: boolean;
  playAlways?: boolean;
  showComments?: boolean;
};

export default function VideoItem({
  item,
  index = 0,
  currentIndex = 0,
  isFocused = true,
  muted,
  mutedIcon,
  windowHeight,
  longPressedIndex,
  setMuted,
  setMutedIcon,
  setLongPressedIndex,
  deleteVideo,
  showDelete = true,
  playAlways = false,
  singleScreen,
  showComments,
}: Props) {
  const videoRef = useRef<IVideo | null>(null);
  const [isViewed, setIsViewed] = useState(item.partnerWatched ?? false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(
    showComments ?? false
  );
  const [totalComments, setTotalComments] = useState(
    item?.comments?.length ?? 0
  );
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const navigation: any = useNavigation();
  const { user } = useAuthStore();
  const { formatDate } = useHelper();
  const insets = useSafeAreaInsets();

  const shouldPlay =
    playAlways || (Math.abs(currentIndex - index) <= 0 && isFocused);
  const paused = !shouldPlay || longPressedIndex === index;

  const handleViewed = useCallback(async () => {
    try {
      setIsViewed(true);
      await VideoRepo.markVideoAsViewed(item._id);
    } catch (err) {
      console.error("markRead video error:", err);
    }
  }, [item._id]);
  useEffect(() => {
    setCommentsModalVisible(showComments ?? false);
  }, [item._id]);
  return (
    <View style={[styles.videoContainer, { height: windowHeight }]}>
      {shouldPlay && (
        <>
          <Video
            ref={(ref) => (videoRef.current = ref)}
            source={{ uri: item.url }}
            style={styles.video}
            resizeMode="contain"
            repeat
            muted={muted}
            controls={false}
            paused={paused}
            onError={(err) => console.warn("Video error:", item._id, err)}
            onEnd={() => {
              videoRef.current = null;
            }}
            onLoad={(data) => setDuration(data.duration)}
            onProgress={(data) => setCurrentTime(data.currentTime)}
          />
          <View style={styles.overlayBackground} />
        </>
      )}

      <Pressable
        style={styles.overlay}
        onPress={() => {
          setMuted((m) => !m);
          setMutedIcon(true);
        }}
        onLongPress={() => setLongPressedIndex?.(index)}
        onPressOut={() => setLongPressedIndex?.(null)}
      >
        <Spacer size={insets.top} />
        {/* Top Row: Back + Title + Duration */}
        <Row
          alignItems="center"
          justifyContent="space-between"
          style={{ padding: 12 }}
        >
          <Row alignItems="center" gap={8}>
            {singleScreen && (
              <Ionicons
                onPress={() => navigation.goBack()}
                name="chevron-back-outline"
                color={"#fff"}
                size={30}
              />
            )}
            <Column gap={2}>
              <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
                {item.title}
              </Text>
            </Column>
          </Row>
        </Row>

        {/* Center Mute Icon */}
        <Column
          style={commonStyles.fullFlex}
          justifyContent="center"
          alignItems="center"
        >
          {mutedIcon && (
            <Ionicons
              name={muted ? "volume-mute-outline" : "volume-high-outline"}
              size={50}
              color={"#fff"}
            />
          )}
        </Column>

        {/* Bottom Row */}
        <Row
          justifyContent="space-between"
          alignItems="flex-end"
          style={{ padding: 12 }}
        >
          <Row alignItems="center" gap={8}>
            <Avatar
              size={45}
              name={item.createdByDetails?.name}
              image={item.createdByDetails?.image}
            />
            <Column gap={2}>
              <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
                {item.createdByDetails?.name}
              </Text>
              <Text style={[commonStyles.smallText, { color: "#fff" }]}>
                {formatDate(item.createdAt)}
              </Text>
            </Column>
          </Row>
          <Column gap={20}>
            <Column alignItems="center" gap={4}>
              <Ionicons
                onPress={() => setCommentsModalVisible(true)}
                name="chatbubble-outline"
                color={"#fff"}
                size={35}
              />
              <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
                {totalComments}
              </Text>
            </Column>

            {user?.userId !== item.createdBy && !isViewed ? (
              <Ionicons
                onPress={handleViewed}
                name="eye-outline"
                color={"#fff"}
                size={35}
              />
            ) : (
              <Ionicons
                name={isViewed ? "eye" : "eye-off"}
                color={"#fff"}
                size={35}
              />
            )}
            {user?.userId === item.createdBy && showDelete && (
              <Ionicons
                onPress={() => deleteVideo?.(item._id)}
                name="trash"
                color={theme.colors.error}
                size={35}
              />
            )}
          </Column>
        </Row>
        <View style={{ height: 5 }}>
          <ProgressBar currentTime={currentTime} duration={duration} />
        </View>
      </Pressable>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        fetchUrl={`${AppUrl.getVideoComments(item._id)}`}
        postUrl={`${AppUrl.addVideoComment(item._id)}`}
        entityId={item._id}
        setCount={setTotalComments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width: "100%" },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
    zIndex: 1,
  },
});
