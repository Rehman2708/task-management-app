import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import { useHelper } from "../../utils/helper";
import { SubtaskStatus } from "../../enums/tasks";
import { AppUrl } from "../../utils/appUrl";

import CustomButton from "../../components/customButton";
import ScreenLoader from "../../components/screenLoader";
import Avatar from "../../components/avatar";
import EmptyState from "../../components/emptyState";
import TimeLeftProgress from "../../components/timeLeftProgress";
import CollapsibleHeaderTabs from "../../components/collapsibleHeader";
import { TaskDetailStyles } from "./styles";
import { AssignedIcon } from "../CreateTask/components/subtaskItem";
import CommentsModal from "../../components/comments/commentModal";
import { Subtask } from "../../types/task";

export default function TaskDetailScreen({ route }: any) {
  const { taskId, readOnly = false } = route.params;
  const {
    task,
    taskDetailLoading,
    error,
    fetchTaskDetail,
    updateSubtaskStatus,
    subtaskStatusLoading,
  } = useTaskDetailViewModel(taskId);

  const { formatDate } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = TaskDetailStyles(theme);

  const [showTaskComments, setShowTaskComments] = useState(false);
  const [showSubTaskComments, setShowSubTaskComments] = useState(false);
  const [commentModalId, setCommentModalId] = useState("");

  const handleOpenSubtaskComments = useCallback((subtaskId: string) => {
    setCommentModalId(subtaskId);
    setShowSubTaskComments(true);
  }, []);

  const handleUpdateStatus = useCallback(
    (id: string) => updateSubtaskStatus(id, SubtaskStatus.Completed),
    [updateSubtaskStatus]
  );

  const renderSubtask = useCallback(
    ({ item }: { item: Subtask }) => {
      const backgroundColor =
        item.status === SubtaskStatus.Completed
          ? `${theme.colors.success}20`
          : `${theme.colors.error}20`;

      return (
        <Column
          gap={8}
          style={[
            commonStyles.cardContainer,
            { backgroundColor, borderColor: backgroundColor },
          ]}
        >
          <Row justifyContent="space-between" alignItems="center">
            <Column gap={6} style={commonStyles.fullFlex}>
              <Text style={commonStyles.basicText}>{item.title}</Text>
              {item.dueDateTime && (
                <Row alignItems="center">
                  <Ionicons
                    name="timer-outline"
                    size={12}
                    color={theme.colors.textLight}
                  />
                  <Text style={commonStyles.tTinyText}>
                    {" "}
                    Due: {formatDate(item.dueDateTime)}
                  </Text>
                </Row>
              )}
            </Column>
          </Row>

          {!readOnly &&
            item.status === SubtaskStatus.Pending &&
            task?.createdAt && (
              <Row alignItems="center" style={commonStyles.fullFlex}>
                <Text style={commonStyles.tTinyText}>Time left: </Text>
                <TimeLeftProgress
                  startTime={task.createdAt}
                  endTime={item.dueDateTime}
                />
              </Row>
            )}
          <Row alignItems="center" justifyContent="space-between">
            <Pressable
              onPress={() => handleOpenSubtaskComments(item._id)}
              style={{ marginTop: theme.spacing.sm }}
            >
              <Row alignItems="center" gap={6}>
                <Text style={commonStyles.subTitleText}>
                  {item.totalComments ?? 0}
                </Text>
                <Ionicons
                  name="chatbubble-outline"
                  size={30}
                  color={theme.colors.text}
                />
              </Row>
            </Pressable>
            {!readOnly && item.status === SubtaskStatus.Pending && (
              <CustomButton
                onPress={() => handleUpdateStatus(item._id)}
                iconName="checkmark-done-outline"
                title="Send"
                sendButton
                loading={subtaskStatusLoading === item._id}
                success
              />
            )}
          </Row>
        </Column>
      );
    },
    [
      theme,
      commonStyles,
      task?.createdAt,
      readOnly,
      subtaskStatusLoading,
      handleUpdateStatus,
      handleOpenSubtaskComments,
    ]
  );

  const taskSubtitle = useMemo(
    () => (task?.createdAt ? formatDate(task.createdAt) : ""),
    [task?.createdAt, formatDate]
  );

  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <CollapsibleHeaderTabs
        title={task?.title ?? "Task"}
        subTitle={taskSubtitle}
        headerImage={task?.image}
      >
        {error ? (
          <EmptyState text="Retry" button={fetchTaskDetail} error />
        ) : taskDetailLoading ? (
          <ScreenLoader />
        ) : (
          task && (
            <Column gap={12}>
              {task.description && (
                <Text style={commonStyles.smallText}>{task.description}</Text>
              )}

              <Row justifyContent="space-between">
                <Row alignItems="center">
                  <Text style={commonStyles.tTinyText}>Creator: </Text>
                  <Avatar
                    name={
                      task.createdByDetails
                        ? task.createdByDetails.name.split(" ")[0]
                        : task.createdBy
                    }
                    image={task.createdByDetails?.image}
                    withName
                  />
                </Row>

                <Row alignItems="flex-start">
                  <Text style={commonStyles.tinyText}>
                    Assigned To: {task.assignedTo}{" "}
                  </Text>
                  <AssignedIcon
                    type={task.assignedTo}
                    size={12}
                    color={theme.colors.text}
                  />
                </Row>
              </Row>

              {task.subtasks?.length > 0 && (
                <View style={styles.container}>
                  <Text style={commonStyles.subTitleText}>Subtasks</Text>
                  <Spacer size={8} />
                  <FlatList
                    data={task.subtasks}
                    keyExtractor={(item) => item._id}
                    renderItem={renderSubtask}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps="always"
                  />
                </View>
              )}

              <View style={styles.container}>
                <Row justifyContent="space-between" alignItems="center">
                  <Text style={commonStyles.basicText}>Task Comments</Text>
                  <Pressable onPress={() => setShowTaskComments(true)}>
                    <Row alignItems="center" gap={6}>
                      <Text style={commonStyles.subTitleText}>
                        {task.totalComments ?? 0}
                      </Text>
                      <Ionicons
                        name="chatbubble-outline"
                        size={30}
                        color={theme.colors.text}
                      />
                    </Row>
                  </Pressable>
                </Row>
                <Spacer size={12} />
              </View>
            </Column>
          )
        )}
      </CollapsibleHeaderTabs>

      {/* Task Comments Modal */}
      <CommentsModal
        visible={showTaskComments}
        onClose={() => setShowTaskComments(false)}
        fetchUrl={AppUrl.getTaskComments(taskId)}
        postUrl={AppUrl.addTaskComment(taskId)}
        entityId={taskId}
      />

      {/* Subtask Comments Modal */}
      <CommentsModal
        visible={showSubTaskComments}
        onClose={() => setShowSubTaskComments(false)}
        fetchUrl={AppUrl.getSubtaskComments(taskId, commentModalId)}
        postUrl={AppUrl.addSubtaskComment(taskId, commentModalId)}
        entityId={taskId}
        subtask={commentModalId}
      />
    </View>
  );
}
