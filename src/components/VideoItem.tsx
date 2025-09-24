import { useEffect, useRef } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";

import { IVideo } from "../types/videos";
import Avatar from "./avatar";
import { Column, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import { useNavigation } from "@react-navigation/native";

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
  showDelete?: boolean; // for reels only
  singleScreen?: boolean; // for reels only
  playAlways?: boolean; // for single video screen
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
}: Props) {
  const videoRef = useRef<IVideo | null>(null);
  const { formatDate } = useHelper();
  const navigation: any = useNavigation();
  // Only render video if in focus or always playing
  const shouldRenderVideo =
    playAlways || (Math.abs(currentIndex - index) <= 1 && isFocused);

  useEffect(() => {
    return () => {
      videoRef.current = null;
    };
  }, []);

  return (
    <View style={[styles.videoContainer, { height: windowHeight }]}>
      {shouldRenderVideo && (
        <Video
          ref={(ref) => {
            videoRef.current = ref;
          }}
          source={{ uri: item.url }}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted={muted}
          controls={false}
          paused={
            playAlways
              ? false
              : index !== currentIndex || longPressedIndex === index
          }
          onError={(err) => {
            console.warn("Video error:", item._id, err);
            videoRef.current = null;
          }}
          onEnd={() => {
            videoRef.current = null;
          }}
        />
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
        <Row alignItems="center" gap={8} style={{ padding: 12 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="chevron-back-outline"
            color={"#fff"}
            size={30}
          />
          <Column gap={2}>
            <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
              {item.title}
            </Text>
          </Column>
        </Row>

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

        <Row
          justifyContent="space-between"
          alignItems="center"
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

          {showDelete && (
            <Ionicons
              onPress={() => deleteVideo?.(item._id)}
              name="trash"
              color={"red"}
              size={35}
            />
          )}
        </Row>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width: "100%" },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
});
