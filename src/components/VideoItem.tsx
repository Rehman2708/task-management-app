import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";

import { IVideo, IVideoComment } from "../types/videos";
import Avatar from "./avatar";
import { Column, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { VideoRepo } from "../repositories/videos";
import CommentCard from "./commentCard";
import CustomButton from "./customButton";
import CustomInput from "./customInput";
import { theme } from "../infrastructure/theme";
import EmptyState from "./emptyState";

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
  const [isViewed, setIsViewed] = useState(item.partnerWatched ?? false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [comments, setComments] = useState<IVideoComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const navigation: any = useNavigation();
  const { user } = useAuthStore();
  const { formatDate } = useHelper();

  const shouldPlay =
    playAlways || (Math.abs(currentIndex - index) <= 0 && isFocused);
  const paused = !shouldPlay || longPressedIndex === index;

  useEffect(() => {
    if (commentsModalVisible) fetchComments();
  }, [commentsModalVisible]);

  const fetchComments = async () => {
    try {
      const res: any = await VideoRepo.getVideoComments(item._id);
      if (res?.comments) setComments(res.comments);
    } catch (err) {
      console.error("fetchComments error:", err);
    }
  };

  const handleViewed = useCallback(async () => {
    try {
      setIsViewed(true);
      await VideoRepo.markVideoAsViewed(item._id);
    } catch (err) {
      console.error("markRead video error:", err);
    }
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.userId) return;

    try {
      const res: any = await VideoRepo.addVideoComment(item._id, {
        createdBy: user.userId,
        text: newComment.trim(),
      });

      if (res?.comments) {
        setComments(res.comments);
        setNewComment("");
      }
    } catch (err) {
      console.error("add comment error:", err);
    }
  };

  return (
    <View style={[styles.videoContainer, { height: windowHeight }]}>
      {shouldPlay && (
        <Video
          ref={(ref) => (videoRef.current = ref)}
          source={{ uri: item.url }}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted={muted}
          controls={false}
          paused={paused}
          onError={(err) => console.warn("Video error:", item._id, err)}
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
            <Ionicons
              onPress={() => setCommentsModalVisible(true)}
              name="chatbubble-outline"
              color={"white"}
              size={35}
            />
            {user?.userId !== item.createdBy && !isViewed && (
              <Ionicons
                onPress={handleViewed}
                name="eye-outline"
                color={"white"}
                size={35}
              />
            )}
            {user?.userId === item.createdBy && showDelete && (
              <Ionicons
                onPress={() => deleteVideo?.(item._id)}
                name="trash"
                color={"red"}
                size={35}
              />
            )}
          </Column>
        </Row>
      </Pressable>

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <Pressable
          onPress={() => setCommentsModalVisible(false)}
          style={styles.modalOverlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <Row
              justifyContent="space-between"
              style={{ paddingHorizontal: 6, paddingVertical: 20 }}
            >
              <Text style={[commonStyles.subTitleText]}>Comments</Text>
              <Ionicons
                name="close"
                size={30}
                color={theme.colors.text}
                onPress={() => setCommentsModalVisible(false)}
              />
            </Row>
            <FlatList
              data={comments}
              keyExtractor={(item, idx) => item._id || idx.toString()}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              renderItem={({ item: c, index }) => {
                const prev = comments?.[index - 1];
                const sameUser = index > 0 && c?.createdBy === prev?.createdBy;
                return (
                  <>
                    <CommentCard
                      image={c?.createdByDetails?.image}
                      text={c?.text}
                      name={c?.createdByDetails?.name ?? c?.createdBy}
                      userId={c?.createdBy}
                      time={formatDate(c?.createdAt!)}
                      repeated={sameUser}
                    />
                  </>
                );
              }}
              ListEmptyComponent={<EmptyState text="No Comments" />}
            />
            <View
              style={{ gap: 8, flexDirection: "row", alignItems: "center" }}
            >
              <CustomInput
                placeholder="Add comment..."
                value={newComment}
                onChangeText={setNewComment}
                fullFlex
                multiline
                rounded
                inputStyle={{
                  minHeight: 40,
                  textAlignVertical: "center",
                }}
              />

              <CustomButton
                onPress={handleAddComment}
                title="Send"
                sendButton
              />
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { width: "100%" },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 6,
    height: "70%",
  },
});
