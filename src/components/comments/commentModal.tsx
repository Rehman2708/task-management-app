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
import { IComment, useCommentsViewModel } from "./useCommentsViewModel";
import { useEffect, useState } from "react";
import { LoaderTypes } from "../screenLoader";
import { UploadMediaButton } from "../UploadMediaButton";
import { useHelper } from "../../utils/helper";

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
type GroupedComments = {
  date: string;
  comments: IComment[];
};

export default function GlobalCommentsModal({
  visible,
  onClose,
  fetchUrl,
  postUrl,
  entityId,
  autoRefresh = true,
  refreshInterval = 5000,
  subtask,
  setCount,
}: Props) {
  const theme = useTheme();
  const { themeColor } = useHelper();
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

  // Listen to keyboard show/hide events
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

  const groupCommentsByDate = (comments: IComment[]) =>
    comments.reduce<Record<string, IComment[]>>((acc, comment) => {
      const dateKey = new Date(comment.date ?? comment.createdAt ?? new Date())
        .toISOString()
        .split("T")[0];

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(comment);
      return acc;
    }, {});

  const groupedComments = groupCommentsByDate(comments);
  const groupedArray = Object.entries(groupedComments).map(
    ([date, comments]) => ({
      date,
      comments,
    })
  );

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
            height: keyboardVisible ? "100%" : "70%",
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
            {initialLoading || comments.length === 0 ? (
              <EmptyState
                text="No Comments"
                loading={initialLoading}
                type={LoaderTypes.Comment}
              />
            ) : (
              <FlatList<GroupedComments>
                ref={flatListRef as any}
                data={groupedArray}
                keyExtractor={(item) => item.date}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 12, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View>
                    {/* Date Header */}
                    <Row alignItems="center" style={{ marginVertical: 16 }}>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: themeColor.dark,
                          flex: 1,
                          marginHorizontal: 8,
                        }}
                      />
                      <Text style={commonStyles.basicText}>
                        {formatDate(String(item.date), "date")}
                      </Text>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: themeColor.dark,
                          flex: 1,
                          marginHorizontal: 8,
                        }}
                      />
                    </Row>

                    {/* Comments */}
                    {item.comments.map((c, index) => {
                      const prev = item.comments[index - 1];
                      const sameUser =
                        index > 0 &&
                        (c.createdBy || c.by) === (prev?.createdBy || prev?.by);
                      return (
                        <CommentCard
                          key={c._id ?? `${c.by}-${index}`}
                          image={c.createdByDetails?.image}
                          url={c.image}
                          text={c.text}
                          name={c.createdByDetails?.name ?? c.createdBy ?? c.by}
                          userId={c.createdBy ?? c.by}
                          time={formatDate(
                            c.date ?? c.createdAt ?? new Date(),
                            "time"
                          )}
                          repeated={sameUser}
                        />
                      );
                    })}
                  </View>
                )}
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
              {newComment.length < 1 && (
                <Row>
                  <UploadMediaButton
                    onUploadSuccess={async (url) => {
                      if (url) await handleAddComment(url);
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
                onPress={() => handleAddComment()}
                title="Send"
                sendButton
                loading={addingComment}
                disabled={newComment?.length < 1}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
