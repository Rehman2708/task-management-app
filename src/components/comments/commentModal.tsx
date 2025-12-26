import {
  View,
  Text,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from "react-native";
import { memo, useMemo, useCallback } from "react";
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
import AnimatedListItem from "../animatedListItem";
import ImageView from "react-native-image-viewing";

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

// Memoized Comment Item Component for better performance
const CommentItem = memo(
  ({
    comment,
    index,
    prevComment,
    formatDate,
    onImagePress,
  }: {
    comment: IComment;
    index: number;
    prevComment?: IComment;
    formatDate: (date: string | Date, type: string) => string;
    onImagePress: () => void;
  }) => {
    const sameUser =
      index > 0 &&
      (comment.createdBy || comment.by) ===
        (prevComment?.createdBy || prevComment?.by);

    return (
      <AnimatedListItem
        key={comment._id ?? `${comment.by}-${index}`}
        index={index}
        animate={false}
      >
        <CommentCard
          url={comment.image}
          text={comment.text}
          name={
            comment.createdByDetails?.name ?? comment.createdBy ?? comment.by
          }
          userId={comment.createdBy ?? comment.by}
          time={formatDate(
            comment.date ?? comment.createdAt ?? new Date(),
            "time"
          )}
          repeated={sameUser}
          loading={comment.loading}
          onImagePress={onImagePress}
        />
      </AnimatedListItem>
    );
  }
);

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
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const {
    comments,
    newComment,
    setNewComment,
    addingComment,
    handleAddComment,
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

  // Memoized data processing for better performance
  const { groupedArray, imageUrls, imageIndexMap } = useMemo(() => {
    const groupCommentsByDate = (comments: IComment[]) =>
      comments.reduce<Record<string, IComment[]>>((acc, comment) => {
        const dateKey = new Date(
          comment.date ?? comment.createdAt ?? new Date()
        )
          .toISOString()
          .split("T")[0];

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(comment);
        return acc;
      }, {});

    const groupedComments = groupCommentsByDate(comments);
    const groupedArray = Object.entries(groupedComments)
      .map(([date, comments]) => ({
        date,
        comments, // Keep original order within each date group
      }))
      .reverse(); // Reverse date groups for inverted FlatList

    const imageUrls = comments.filter((c) => c.image).map((c) => c.image);
    const imageIndexMap: Record<string, number> = {};
    let currentIndex = 0;

    comments.forEach((c) => {
      if (c.image && c._id) {
        imageIndexMap[c._id] = currentIndex;
        currentIndex++;
      }
    });

    return { groupedArray, imageUrls, imageIndexMap };
  }, [comments]);

  // Memoized handlers
  const handleImagePress = useCallback(
    (commentId: string) => {
      if (commentId && imageIndexMap[commentId] !== undefined) {
        setGalleryIndex(imageIndexMap[commentId]);
        setGalleryVisible(true);
      }
    },
    [imageIndexMap]
  );

  const handleSendComment = useCallback(() => {
    handleAddComment();
  }, [handleAddComment]);

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
        <Pressable onPress={onClose} style={{ flex: 1 }} />
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
            <Text style={commonStyles.subTitleText}>💬 Comments</Text>
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
                text="💬 No Comments"
                loading={initialLoading}
                type={LoaderTypes.Comment}
              />
            ) : (
              <FlatList<GroupedComments>
                data={groupedArray}
                keyExtractor={(item) => item.date}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 12, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                inverted
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={15}
                getItemLayout={undefined} // Let FlatList handle dynamic heights
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
                      <Text style={commonStyles.smallText}>
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
                    {item.comments.map((c, index) => (
                      <CommentItem
                        key={c._id ?? `${c.by}-${index}`}
                        comment={c}
                        index={index}
                        prevComment={item.comments[index - 1]}
                        formatDate={formatDate}
                        onImagePress={() => handleImagePress(c._id || "")}
                      />
                    ))}
                  </View>
                )}
                ListEmptyComponent={<EmptyState text="💬 No Comments" />}
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
                placeholder="💬 Add comment..."
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
                onPress={handleSendComment}
                title="📤 Send"
                sendButton
                loading={addingComment}
                disabled={newComment?.length < 1}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
      <ImageView
        images={imageUrls.map((u) => ({ uri: u }))}
        visible={galleryVisible}
        imageIndex={galleryIndex}
        onRequestClose={() => setGalleryVisible(false)}
        swipeToCloseEnabled
        presentationStyle="fullScreen"
        backgroundColor={theme.colors.background}
      />
    </Modal>
  );
}
