import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IVideoComment } from "../../types/videos";
import { useAuthStore } from "../../store/authStore";
import { VideoRepo } from "../../repositories/videos";
import { theme } from "../../infrastructure/theme";
import { Row } from "../../tools";
import { commonStyles } from "../../styles/commonstyles";
import CommentCard from "../../components/commentCard";
import EmptyState from "../../components/emptyState";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useHelper } from "../../utils/helper";

type Props = {
  videoId: string;
  visible: boolean;
  onClose: () => void;
};

export default function VideoCommentsModal({
  videoId,
  visible,
  onClose,
}: Props) {
  const [comments, setComments] = useState<IVideoComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const { user } = useAuthStore();
  const { formatDate } = useHelper();

  // Fetch comments initially and poll every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (visible) {
      fetchComments();
      interval = setInterval(fetchComments, 3000);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const fetchComments = async () => {
    try {
      const res: any = await VideoRepo.getVideoComments(videoId);
      if (res?.comments) setComments(res.comments);
    } catch (err) {
      console.error("fetchComments error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.userId) return;
    setAddingComment(true);
    try {
      const res: any = await VideoRepo.addVideoComment(videoId, {
        createdBy: user.userId,
        text: newComment.trim(),
      });

      if (res?.comments) {
        setComments(res.comments);
        setNewComment("");
      }
    } catch (err) {
      console.error("add comment error:", err);
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 6,
            height: "70%",
          }}
        >
          <Row
            justifyContent="space-between"
            style={{ paddingHorizontal: 6, paddingVertical: 20 }}
          >
            <Text style={commonStyles.subTitleText}>Comments</Text>
            <Ionicons
              name="close"
              size={30}
              color={theme.colors.text}
              onPress={onClose}
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
                <CommentCard
                  image={c?.createdByDetails?.image}
                  text={c?.text}
                  name={c?.createdByDetails?.name ?? c?.createdBy}
                  userId={c?.createdBy}
                  time={formatDate(c?.createdAt!)}
                  repeated={sameUser}
                />
              );
            }}
            ListEmptyComponent={<EmptyState text="No Comments" />}
          />

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <CustomInput
              placeholder="Add comment..."
              value={newComment}
              onChangeText={setNewComment}
              fullFlex
              multiline
              rounded
              inputStyle={{ minHeight: 40, textAlignVertical: "center" }}
            />
            <CustomButton
              onPress={handleAddComment}
              title="Send"
              sendButton
              loading={addingComment}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
