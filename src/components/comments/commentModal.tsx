import {
  View,
  Text,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { Row } from "../../tools";
import CommentCard from "../commentCard";
import EmptyState from "../emptyState";
import CustomInput from "../customInput";
import CustomButton from "../customButton";
import { useCommentsViewModel } from "./useCommentsViewModel";
import { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  fetchUrl: string;
  postUrl: string;
  entityId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  subtask?: string;
};

export default function GlobalCommentsModal({
  visible,
  onClose,
  fetchUrl,
  postUrl,
  entityId,
  autoRefresh,
  refreshInterval,
  subtask,
}: Props) {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    comments,
    newComment,
    setNewComment,
    addingComment,
    handleAddComment,
    flatListRef,
    formatDate,
    isFetching,
  } = useCommentsViewModel(
    fetchUrl,
    postUrl,
    entityId,
    visible,
    autoRefresh,
    refreshInterval,
    subtask
  );

  // 👇 Listen to keyboard open/close events
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: keyboardVisible ? "100%" : "70%", // ✅ instantly reacts
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
              extraData={comments}
              keyExtractor={(item, index) =>
                item._id ? item._id.toString() : `${item.by}-${index}`
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingBottom: 10,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: c, index }) => {
                const prev = comments[index - 1];
                const sameUser =
                  index > 0 &&
                  (c.createdBy || c.by) === (prev?.createdBy || prev?.by);
                return (
                  <CommentCard
                    image={c.createdByDetails?.image}
                    text={c.text}
                    name={c.createdByDetails?.name ?? c.createdBy ?? c.by}
                    userId={c.createdBy || c.by}
                    time={formatDate(c.createdAt!)}
                    repeated={sameUser}
                  />
                );
              }}
              ListEmptyComponent={<EmptyState text="No Comments" />}
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
                  maxHeight: 100,
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
    </Modal>
  );
}
