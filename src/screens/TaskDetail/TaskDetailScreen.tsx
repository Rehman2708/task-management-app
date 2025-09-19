import { useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { theme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { commonStyles } from "../../styles/commonstyles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Column, isAndroid, Row } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ScreenLoader from "../../components/screenLoader";
import { useHelper } from "../../utils/helper";
import ImageModal from "../../components/imageModal";

export default function TaskDetailScreen({ route }: any) {
  const { taskId, readOnly = false } = route.params; // readOnly true for completed/expired
  const {
    task,
    taskDetailLoading: loading,
    taskCommentLoading,
    subtaskCommentLoading,
    error,
    fetchTaskDetail,
    updateSubtaskStatus,
    addTaskComment,
    addSubtaskComment,
  } = useTaskDetailViewModel(taskId);
  const { formatDate, themeColor } = useHelper();
  const [taskComment, setTaskComment] = useState("");
  const [subtaskComments, setSubtaskComments] = useState<
    Record<string, string>
  >({});

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={commonStyles.errorText}>{error}</Text>
        <Pressable onPress={fetchTaskDetail}>
          <Text style={{ color: theme.colors.primary, marginTop: 8 }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );

  const renderSubtask = ({ item }: { item: any }) => (
    <Column
      gap={isAndroid ? 6 : 8}
      style={[
        commonStyles.cardContainer,
        {
          backgroundColor:
            item.status === "Completed"
              ? `${theme.colors.success}20`
              : `${theme.colors.error}20`,
          borderColor:
            item.status === "Completed"
              ? `${theme.colors.success}20`
              : `${theme.colors.error}20`,
        },
      ]}
    >
      <Text style={commonStyles.basicText}>{item.title}</Text>
      <Row alignItems="flex-end" justifyContent="space-between">
        <Text style={commonStyles.tinyText}>Status: {item.status}</Text>
        {item.dueDateTime && (
          <Text style={commonStyles.tTinyText}>
            Due: {formatDate(item.dueDateTime)}
          </Text>
        )}
      </Row>

      {/* Subtask Comments */}
      <View style={{ marginTop: theme.spacing.sm }}>
        {item.comments?.map((c: any, idx: number) => (
          <Column key={idx}>
            <Row gap={isAndroid ? 6 : 8} alignItems="center">
              <Ionicons name="ellipse" color={themeColor.dark} size={10} />
              <Text key={idx} style={commonStyles.smallText}>
                {c.createdBy}: {c.text}
              </Text>
            </Row>
            <Row justifyContent="flex-end">
              <Text style={commonStyles.tTinyText}>
                {new Date(c.createdAt).toLocaleString()}
              </Text>
            </Row>
          </Column>
        ))}
        {!readOnly && item.status !== "Completed" && (
          <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
            <CustomInput
              placeholder="Add comment..."
              value={subtaskComments[item._id] || ""}
              onChangeText={(text) =>
                setSubtaskComments({ ...subtaskComments, [item._id]: text })
              }
              fullFlex
            />

            <CustomButton
              onPress={() => {
                if (subtaskComments[item._id]) {
                  addSubtaskComment(item._id, subtaskComments[item._id]);
                  setSubtaskComments({ ...subtaskComments, [item._id]: "" });
                }
              }}
              title="Send"
              sendButton
              loading={subtaskCommentLoading}
            />
          </View>
        )}
        {!readOnly && item.status === "Pending" && (
          <CustomButton
            onPress={() => updateSubtaskStatus(item._id, "Completed")}
            title="Mark Complete"
            small
            halfWidth
            rounded
            success
          />
        )}
      </View>
    </Column>
  );

  return (
    <ScreenWrapper
      title={task?.title ?? "Task"}
      showBackbutton
      subTitle={formatDate(task?.createdAt)}
      image={task?.image}
    >
      {loading ? (
        <ScreenLoader />
      ) : (
        <View style={[commonStyles.screenWrapper]}>
          {task?.image && <ImageModal disabled defaultImage={task.image} />}
          {task && (
            <KeyboardAwareScrollView
              style={commonStyles.fullFlex}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={fetchTaskDetail}
                  colors={[theme.colors.primary]}
                />
              }
            >
              <Column gap={isAndroid ? 5 : 6}>
                <Text style={commonStyles.subTitleText}>{task?.title}</Text>
                {task?.description && (
                  <Text style={commonStyles.smallText}>
                    {task?.description}
                  </Text>
                )}
                <Row justifyContent="space-between">
                  <Text style={commonStyles.tinyText}>
                    Created By: {task?.createdBy}
                  </Text>
                  <Text style={commonStyles.tinyText}>
                    Assigned To: {task?.assignedTo}
                  </Text>
                </Row>
                {task?.subtasks?.length > 0 && (
                  <View style={commonStyles.secondaryContainer}>
                    <Text style={commonStyles.basicText}>Subtasks</Text>
                    <FlatList
                      data={task?.subtasks}
                      keyExtractor={(item) => item._id}
                      renderItem={renderSubtask}
                      scrollEnabled={false}
                    />
                  </View>
                )}
                {task?.comments?.length > 0 && (
                  <View style={commonStyles.secondaryContainer}>
                    <Text style={commonStyles.basicText}>Task Comments</Text>
                    {task?.comments?.map((c: any, idx: number) => (
                      <View key={idx} style={commonStyles.cardContainer}>
                        <Row gap={isAndroid ? 6 : 8} alignItems="center">
                          <Ionicons
                            name="ellipse"
                            color={themeColor.dark}
                            size={10}
                          />
                          <Text key={idx} style={commonStyles.smallText}>
                            {c.by}: {c.text}
                          </Text>
                        </Row>
                        <Row justifyContent="flex-end">
                          <Text style={commonStyles.tTinyText}>
                            {new Date(c.date).toLocaleString()}
                          </Text>
                        </Row>
                      </View>
                    ))}
                  </View>
                )}
                {!readOnly && (
                  <View
                    style={{
                      marginTop: theme.spacing.md,
                      gap: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <CustomInput
                      placeholder="Add comment on task?..."
                      value={taskComment}
                      onChangeText={setTaskComment}
                      fullFlex
                    />
                    <CustomButton
                      title="Send"
                      loading={taskCommentLoading}
                      sendButton
                      onPress={() => {
                        if (taskComment) {
                          addTaskComment(taskComment);
                          setTaskComment("");
                        }
                      }}
                    />
                  </View>
                )}
              </Column>
            </KeyboardAwareScrollView>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
