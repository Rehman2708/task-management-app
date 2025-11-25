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
import { isAndroid, Row } from "../../tools";
import CommentCard from "../commentCard";
import EmptyState from "../emptyState";
import CustomInput from "../customInput";
import CustomButton from "../customButton";
import { useCommentsViewModel } from "./useCommentsViewModel";
import { useEffect, useState } from "react";
import { LoaderTypes } from "../screenLoader";
import { UploadMediaButton } from "../UploadMediaButton";

type Props = {
  visible: boolean;
  onClose: () => void;
  fetchUrl: string;
  postUrl: string;
  entityId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  subtask?: string;
  setCount?: (count: number) => void;
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
  setCount,
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
    initialLoading,
  } = useCommentsViewModel(
    fetchUrl,
    postUrl,
    entityId,
    visible,
    autoRefresh,
    refreshInterval,
    subtask,
    setCount
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
          backgroundColor: "#000000b3",
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
            style={{ paddingHorizontal: 12, paddingVertical: 16 }}
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
            {initialLoading || !comments?.length ? (
              <EmptyState
                text="No Comments"
                loading={initialLoading}
                type={LoaderTypes.Comment}
              />
            ) : (
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
                      url={c.image}
                      text={c?.text}
                      name={c.createdByDetails?.name ?? c.createdBy ?? c.by}
                      userId={c.createdBy || c.by}
                      time={formatDate(c.createdAt!)}
                      repeated={sameUser}
                    />
                  );
                }}
                ListEmptyComponent={<EmptyState text="No Comments" />}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                marginBottom: !isAndroid ? 20 : 0,
                paddingHorizontal: 8,
              }}
            >
              {newComment?.length < 1 && (
                <Row>
                  <UploadMediaButton
                    onUploadSuccess={async (url) => {
                      if (url) {
                        await handleAddComment(url);
                      }
                    }}
                  />
                </Row>
              )}
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
                onPress={() => handleAddComment(undefined)}
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
