import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { commonStyles } from "../../styles/commonstyles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Column, Row, Spacer } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
    <Column gap={8} style={[commonStyles.cardContainer, {}]}>
      <Text style={commonStyles.subTitleText}>{item.title}</Text>
      <Row alignItems="flex-end" justifyContent="space-between">
        <Text style={commonStyles.smallText}>Status: {item.status}</Text>
        {item.dueDateTime && (
          <Text style={commonStyles.tinyText}>
            Due: {new Date(item.dueDateTime).toLocaleString()}
          </Text>
        )}
      </Row>

      {/* Subtask Comments */}
      <View style={{ marginTop: theme.spacing.sm }}>
        {item.comments?.map((c: any, idx: number) => (
          <Row gap={8} alignItems="center">
            <Ionicons name="ellipse" size={10} />
            <Text key={idx} style={commonStyles.smallText}>
              {c.createdBy}: {c.text}
            </Text>
          </Row>
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
      subTitle={`Tasks > Details`}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={[commonStyles.screenWrapper]}>
          {task && (
            <KeyboardAwareScrollView
              style={commonStyles.fullFlex}
              showsVerticalScrollIndicator={false}
            >
              <Column gap={6}>
                <Text style={commonStyles.titleText}>{task.title}</Text>
                {task.description && (
                  <Text style={commonStyles.smallText}>{task.description}</Text>
                )}
                <Row justifyContent="space-between">
                  <Text style={commonStyles.tinyText}>
                    Created By: {task.createdBy}
                  </Text>
                  <Text style={commonStyles.tinyText}>
                    Assigned To: {task.assignedTo}
                  </Text>
                </Row>
                {task.subtasks.length > 0 && (
                  <View style={commonStyles.secondaryContainer}>
                    <Text style={commonStyles.basicText}>Subtasks</Text>
                    <FlatList
                      data={task.subtasks}
                      keyExtractor={(item) => item._id}
                      renderItem={renderSubtask}
                      scrollEnabled={false}
                    />
                  </View>
                )}
                {task.comments.length > 0 && (
                  <View style={commonStyles.secondaryContainer}>
                    <Text style={commonStyles.basicText}>Task Comments</Text>
                    {task.comments?.map((c: any, idx: number) => (
                      <View key={idx} style={commonStyles.cardContainer}>
                        <Row gap={8} alignItems="center">
                          <Ionicons name="ellipse" size={10} />
                          <Text key={idx} style={commonStyles.smallText}>
                            {c.by}: {c.text}
                          </Text>
                        </Row>
                        <Text style={commonStyles.tinyText}>
                          {new Date(c.date).toLocaleString()}
                        </Text>
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
                      placeholder="Add comment on task..."
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
