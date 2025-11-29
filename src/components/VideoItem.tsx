import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
import VideoTimeProgressBar from "./videoTimeProgress";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentsModal from "./comments/commentModal";
import { AppUrl } from "../utils/appUrl";
import throttle from "lodash.throttle";

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
  playAlways?: boolean;
  showComments?: boolean;
  singleScreen?: boolean;
  preload?: boolean;
};

function VideoItemComponent({
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
  showComments,
  singleScreen,
  preload = false,
}: Props) {
  const videoRef = useRef<IVideo>(null);
  const [isReady, setIsReady] = useState(false);
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
  const { formatDate, themeColor } = useHelper();
  const insets = useSafeAreaInsets();

  const shouldPlay = playAlways || (currentIndex === index && isFocused);
  const paused = !shouldPlay || longPressedIndex === index;

  const throttledSetCurrentTime = useCallback(
    throttle((time: number) => setCurrentTime(time), 200),
    []
  );

  const handleViewed = useCallback(async () => {
    if (isViewed) return;
    setIsViewed(true);
    try {
      await VideoRepo.markVideoAsViewed(item._id);
    } catch {
      setIsViewed(false);
    }
  }, [isViewed, item._id]);

  const handleLiked = useCallback(async () => {
    const prev = item.isLiked;
    item.isLiked = !prev;
    try {
      await VideoRepo.toggleLiked(item._id);
    } catch {
      item.isLiked = prev;
    }
  }, [item]);

  useEffect(() => {
    if (!isFocused) setCurrentTime(0);
  }, [isFocused]);

  useEffect(() => {
    setCommentsModalVisible(showComments ?? false);
  }, [item._id, showComments]);

  useEffect(() => {
    if (!mutedIcon) return;
    const timer = setTimeout(() => setMutedIcon(false), 2000);
    return () => clearTimeout(timer);
  }, [mutedIcon]);

  // 🔥 ICON LIST (removes repeated code)
  const iconActions = [
    {
      name: item.isLiked ? "heart" : "heart-outline",
      color: item.isLiked ? theme.colors.error : theme.colors.white,
      onPress: handleLiked,
    },
    {
      name: "chatbubble-outline",
      color: theme.colors.white,
      onPress: () => setCommentsModalVisible(true),
      label: totalComments,
    },
    user?.userId === item.createdBy && {
      name: isViewed ? "eye" : "eye-off",
      color: theme.colors.white,
      onPress: undefined,
    },
    user?.userId === item.createdBy &&
      showDelete && {
        name: "trash",
        color: theme.colors.error,
        onPress: () => deleteVideo?.(item._id),
      },
  ].filter(Boolean);

  return (
    <View style={[styles.videoContainer, { height: windowHeight }]}>
      {(shouldPlay || preload) && (
        <>
          <Video
            ref={videoRef as any}
            source={{ uri: item.url }}
            style={styles.video}
            resizeMode="contain"
            repeat
            muted={muted}
            paused={paused}
            controls={false}
            useTextureView
            preferredDecoder="hardware"
            maxBitRate={1200_000}
            bufferConfig={{
              minBufferMs: 5000,
              maxBufferMs: 35000,
              bufferForPlaybackMs: 1500,
              bufferForPlaybackAfterRebufferMs: 2000,
            }}
            onLoad={(data) => {
              setDuration(data.duration);
              setIsReady(true);
            }}
            onProgress={(data) => throttledSetCurrentTime(data.currentTime)}
            onEnd={
              user?.userId !== item.createdBy && !isViewed
                ? handleViewed
                : undefined
            }
            poster={item?.thumbnail}
            posterResizeMode="contain"
          />
          {!isReady && !preload && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={themeColor.dark} />
            </View>
          )}
        </>
      )}

      {/* Mute icon */}
      <Column
        style={styles.overlay}
        justifyContent="center"
        alignItems="center"
      >
        {mutedIcon && (
          <Ionicons
            name={muted ? "volume-mute-outline" : "volume-high-outline"}
            size={50}
            color={theme.colors.white}
          />
        )}
      </Column>

      {/* Tap area */}
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
        <Row justifyContent="space-between" style={styles.topRow}>
          <Row alignItems="center" gap={8}>
            {singleScreen && (
              <Ionicons
                onPress={() => navigation.goBack()}
                name="chevron-back-outline"
                color={theme.colors.white}
                size={30}
              />
            )}
            <Text
              style={[commonStyles.subTitleText, { color: theme.colors.white }]}
            >
              {item.title}
            </Text>
          </Row>
        </Row>

        <View style={{ flex: 1 }} />

        <Row
          justifyContent="space-between"
          alignItems="flex-end"
          style={styles.bottomRow}
        >
          <Row alignItems="center" gap={8}>
            <Avatar
              size={45}
              name={item.createdByDetails?.name}
              image={item.createdByDetails?.image}
            />
            <Column>
              <Text
                style={[commonStyles.basicText, { color: theme.colors.white }]}
              >
                {item.createdByDetails?.name}
              </Text>
              <Text
                style={[commonStyles.tinyText, { color: theme.colors.white }]}
              >
                {formatDate(item.createdAt)}
              </Text>
            </Column>
          </Row>

          <Column gap={16} alignItems="center">
            {iconActions.map((icon: any, i: number) => (
              <Column key={i} alignItems="center">
                <Ionicons
                  onPress={icon.onPress}
                  name={icon.name}
                  color={icon.color}
                  size={28}
                />
                {icon.label != null && (
                  <Text
                    style={[
                      commonStyles.basicText,
                      { color: theme.colors.white },
                    ]}
                  >
                    {icon.label}
                  </Text>
                )}
              </Column>
            ))}
          </Column>
        </Row>
        <View style={{ height: 4 }}>
          <VideoTimeProgressBar currentTime={currentTime} duration={duration} />
        </View>
      </Pressable>

      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        fetchUrl={AppUrl.getVideoComments(item._id)}
        postUrl={AppUrl.addVideoComment(item._id)}
        entityId={item._id}
        setCount={setTotalComments}
      />
    </View>
  );
}

export default React.memo(VideoItemComponent);

const styles = StyleSheet.create({
  videoContainer: { width: "100%" },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000077",
    zIndex: 1,
  },
  topRow: { padding: 12 },
  bottomRow: { padding: 12 },
});
