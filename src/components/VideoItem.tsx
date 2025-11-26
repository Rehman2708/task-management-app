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
  deleteVideo?: (id: string, url: string) => void;
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
  const [isLiking, setIsLiking] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const navigation: any = useNavigation();
  const { user } = useAuthStore();
  const { formatDate } = useHelper();
  const insets = useSafeAreaInsets();

  // Determine if video should play
  const shouldPlay = playAlways || (currentIndex === index && isFocused);
  const paused = !shouldPlay || longPressedIndex === index;

  // Throttle progress updates
  const throttledSetCurrentTime = useCallback(
    throttle((time: number) => {
      setCurrentTime(time);
    }, 250),
    []
  );

  // Mark video as viewed
  const handleViewed = useCallback(async () => {
    if (isViewing || isViewed) return;
    setIsViewing(true);

    setIsViewed(true); // instant UI update

    try {
      await VideoRepo.markVideoAsViewed(item._id);
    } catch (err) {
      setIsViewed(false); // revert if failed
      console.error("mark viewed error:", err);
    } finally {
      setIsViewing(false);
    }
  }, [item._id, isViewing, isViewed]);

  // Mark video as liked or liked
  const handleLiked = useCallback(async () => {
    if (isLiking) return; // prevent double click
    setIsLiking(true);

    const prev = item.isLiked;
    item.isLiked = !prev; // instant UI update

    try {
      await VideoRepo.toggleLiked(item._id);
    } catch (err) {
      item.isLiked = prev; // revert if failed
      console.error("toggle like error:", err);
    } finally {
      setIsLiking(false);
    }
  }, [item, isLiking]);

  // Reset video when screen/tab loses focus
  useEffect(() => {
    if (!isFocused && videoRef.current) {
      videoRef.current.seek(0);
      setCurrentTime(0);
    }
  }, [isFocused]);

  // Sync comments modal visibility
  useEffect(() => {
    setCommentsModalVisible(showComments ?? false);
  }, [item._id, showComments]);

  // Hide mute icon after 2s
  useEffect(() => {
    if (!mutedIcon) return;
    const timer = setTimeout(() => setMutedIcon(false), 2000);
    return () => clearTimeout(timer);
  }, [mutedIcon, setMutedIcon]);

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
            controls={false}
            paused={paused}
            onError={(err) => console.warn("Video error:", item._id, err)}
            onLoad={(data) => {
              setIsReady(true);
              setDuration(data.duration);
            }}
            onProgress={(data) => throttledSetCurrentTime(data.currentTime)}
            onEnd={
              user?.userId !== item.createdBy && !isViewed
                ? handleViewed
                : undefined
            }
          />
          {!isReady && !preload && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </>
      )}

      {/* Center Mute Icon */}
      <Column
        style={[styles.overlay]}
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

      {/* Pressable Overlay */}
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

        {/* Top Row */}
        <Row
          alignItems="center"
          justifyContent="space-between"
          style={styles.topRow}
        >
          <Row alignItems="center" gap={8}>
            {singleScreen && (
              <Ionicons
                onPress={() => navigation.goBack()}
                name="chevron-back-outline"
                color={theme.colors.white}
                size={30}
              />
            )}
            <Column gap={2}>
              <Text
                style={[
                  commonStyles.subTitleText,
                  { color: theme.colors.white },
                ]}
              >
                {item.title}
              </Text>
            </Column>
          </Row>
        </Row>

        <View style={[commonStyles.fullFlex]} />

        {/* Bottom Row */}
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
            <Column gap={2}>
              <Text
                style={[
                  commonStyles.subTitleText,
                  { color: theme.colors.white },
                ]}
              >
                {item.createdByDetails?.name}
              </Text>
              <Text
                style={[commonStyles.smallText, { color: theme.colors.white }]}
              >
                {formatDate(item.createdAt)}
              </Text>
            </Column>
          </Row>

          <Column gap={20}>
            <Ionicons
              onPress={!isLiking ? handleLiked : undefined}
              name={item.isLiked ? "heart" : "heart-outline"}
              color={item.isLiked ? theme.colors.error : theme.colors.white}
              size={35}
              style={{ opacity: isLiking ? 0.5 : 1 }}
            />
            <Column alignItems="center" gap={4}>
              <Ionicons
                onPress={() => setCommentsModalVisible(true)}
                name="chatbubble-outline"
                color={theme.colors.white}
                size={35}
              />
              <Text
                style={[
                  commonStyles.subTitleText,
                  { color: theme.colors.white },
                ]}
              >
                {totalComments}
              </Text>
            </Column>

            {/* {user?.userId !== item.createdBy && !isViewed ? (
              <Ionicons
                onPress={!isViewing && !isViewed ? handleViewed : undefined}
                name={isViewed ? "eye" : "eye-outline"}
                color={theme.colors.white}
                size={35}
              />
            ) : ( */}
            {user?.userId === item.createdBy && (
              <Ionicons
                name={isViewed ? "eye" : "eye-off"}
                color={theme.colors.white}
                size={35}
              />
            )}
            {/* // )} */}

            {user?.userId === item.createdBy && showDelete && (
              <Ionicons
                onPress={() => deleteVideo?.(item._id, item.url)}
                name="trash"
                color={theme.colors.error}
                size={35}
              />
            )}
          </Column>
        </Row>

        <View style={{ height: 4 }}>
          <VideoTimeProgressBar currentTime={currentTime} duration={duration} />
        </View>
      </Pressable>

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

export default React.memo(VideoItemComponent, (prev, next) => {
  return (
    prev.currentIndex === next.currentIndex &&
    prev.muted === next.muted &&
    prev.mutedIcon === next.mutedIcon &&
    prev.longPressedIndex === next.longPressedIndex &&
    prev.item._id === next.item._id &&
    prev.isFocused === next.isFocused // Important for tab focus
  );
});

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
