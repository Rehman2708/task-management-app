import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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
  const flatListRef = useRef<FlatList<IVideoComment>>(null);

  // Fetch comments initially and poll every 3 seconds
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
      if (res?.comments) {
        const prevLength = comments.length;
        setComments(res.comments);

        // Scroll to bottom if new comment appears
        if (res.comments.length > prevLength) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 150);
        }
      }
    } catch (err) {
      console.error("fetchComments error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.userId || addingComment) return;

    Keyboard.dismiss();
    setAddingComment(true);

    try {
      const res: any = await VideoRepo.addVideoComment(videoId, {
        createdBy: user.userId,
        text: newComment.trim(),
      });

      if (res?.comments) {
        setComments(res.comments);
        setNewComment("");
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: "70%",
              paddingHorizontal: 10,
              paddingTop: 10,
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

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
              <FlatList
                ref={flatListRef}
                data={comments}
                keyExtractor={(item, idx) => item._id || idx.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  paddingBottom: 10,
                  flexGrow: 1,
                }}
                renderItem={({ item: c, index }) => {
                  const prev = comments?.[index - 1];
                  const sameUser =
                    index > 0 && c?.createdBy === prev?.createdBy;
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
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: Platform.OS === "ios" ? 20 : 10,
                }}
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
                  loading={addingComment}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
