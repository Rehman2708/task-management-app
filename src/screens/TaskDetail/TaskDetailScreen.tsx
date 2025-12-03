import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Row, Spacer } from "../../tools";
import { useHelper } from "../../utils/helper";
import { AssignedTo, SubtaskStatus } from "../../enums/tasks";
import { AppUrl } from "../../utils/appUrl";

import CustomButton from "../../components/customButton";
import { LoaderTypes } from "../../components/screenLoader";
import EmptyState from "../../components/emptyState";
import TimeLeftProgress from "../../components/timeLeftProgress";
import CollapsibleHeaderTabs from "../../components/collapsibleHeader";
import { TaskDetailStyles } from "./styles";
import { AssignedIcon } from "../CreateTask/components/subtaskItem";
import CommentsModal from "../../components/comments/commentModal";
import { Subtask } from "../../types/task";
import AnimatedListItem from "../../components/animatedListItem";

export default function TaskDetailScreen({ route }: any) {
  const {
    taskId,
    readOnly = false,
    showComments,
    commentSubtaskId,
  } = route.params;

  const {
    task,
    taskDetailLoading,
    error,
    fetchTaskDetail,
    updateSubtaskStatus,
    subtaskStatusLoading,
    taskCommentCount,
    setTaskCommentCount,
    subtaskCommentCounts,
    setSubtaskCommentCounts,
  } = useTaskDetailViewModel(taskId);

  const { formatDate } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = TaskDetailStyles(theme);

  const [commentModal, setCommentModal] = useState<{
    visible: boolean;
    subtaskId?: string;
  }>({
    visible: !!showComments,
    subtaskId: commentSubtaskId ?? undefined,
  });

  const [lastCommentedSubtask, setLastCommentedSubtask] = useState<
    string | null
  >(null);

  const scaleAnimations = useRef<Record<string, Animated.Value>>({}).current;

  const getScaleAnim = useCallback(
    (id: string) => {
      if (!scaleAnimations[id]) {
        scaleAnimations[id] = new Animated.Value(1);
      }
      return scaleAnimations[id];
    },
    [scaleAnimations]
  );

  const triggerBounce = useCallback(
    (id: string) => {
      const anim = getScaleAnim(id);
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.25,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(anim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [getScaleAnim]
  );

  const handleOpenComments = useCallback((subtaskId?: string) => {
    setCommentModal({ visible: true, subtaskId });
    setLastCommentedSubtask(subtaskId ?? null);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentModal({ visible: false });
    if (lastCommentedSubtask) triggerBounce(lastCommentedSubtask);
  }, [lastCommentedSubtask, triggerBounce]);

  const handleUpdateStatus = useCallback(
    (id: string) => updateSubtaskStatus(id, SubtaskStatus.Completed),
    [updateSubtaskStatus]
  );

  // 🔹 Compute once per render — outside renderSubtask
  const uniqueDates = useMemo(() => {
    if (!task?.subtasks?.length) return [];
    const dateSet = new Set(
      task.subtasks
        .filter((s: Subtask) => s.dueDateTime)
        .map((s: Subtask) => new Date(s.dueDateTime).toDateString())
    );
    return Array.from(dateSet);
  }, [task?.subtasks]);

  const hasMultipleDates = uniqueDates.length > 1;

  const renderSubtask = useCallback(
    ({ item, index }: { item: Subtask; index: number }) => {
      const backgroundColor =
        item.status === SubtaskStatus.Completed
          ? `${theme.colors.success}20`
          : `${theme.colors.error}20`;
      const borderColor =
        item.status === SubtaskStatus.Completed
          ? `${theme.colors.success}40`
          : `${theme.colors.error}40`;
      const scale = getScaleAnim(item._id);
      const commentCount = subtaskCommentCounts[item._id] ?? 0;

      // 🔹 Check if this subtask's due date is today
      const isToday = (() => {
        if (!item.dueDateTime) return false;
        const due = new Date(item.dueDateTime);
        const now = new Date();
        return (
          due.getDate() === now.getDate() &&
          due.getMonth() === now.getMonth() &&
          due.getFullYear() === now.getFullYear()
        );
      })();

      const highlightToday = hasMultipleDates && isToday;

      return (
        <AnimatedListItem index={index}>
          <Column
            gap={8}
            style={[
              commonStyles.cardContainer,
              {
                backgroundColor,
                borderColor: highlightToday ? borderColor : backgroundColor,
                borderWidth: highlightToday ? 2 : 1,
              },
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
                onPress={() => handleOpenComments(item._id)}
                style={{ paddingTop: theme.spacing.sm }}
              >
                <Row alignItems="center" gap={4}>
                  <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={theme.colors.text}
                    />
                  </Animated.View>
                  <Text style={commonStyles.smallText}>
                    {commentCount} Comment{commentCount > 1 ? "s" : ""}
                  </Text>
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
        </AnimatedListItem>
      );
    },
    [
      theme,
      commonStyles,
      hasMultipleDates, // include here now
      task?.createdAt,
      readOnly,
      subtaskStatusLoading,
      handleUpdateStatus,
      handleOpenComments,
      getScaleAnim,
      subtaskCommentCounts,
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
        headerImage={task?.image}
        title={task?.title}
        subTitle={formatDate(task?.createdAt)}
      >
        {error || taskDetailLoading ? (
          <EmptyState
            type={LoaderTypes.TaskDetailScreen}
            text="Retry"
            button={fetchTaskDetail}
            error
            loading={taskDetailLoading}
          />
        ) : (
          task && (
            <Column gap={12}>
              <Row justifyContent="space-between" alignItems="center">
                <Column style={commonStyles.fullFlex}>
                  <Text numberOfLines={3} style={commonStyles.titleText}>
                    {task.title}
                  </Text>
                  <Text numberOfLines={3} style={commonStyles.tinyText}>
                    {taskSubtitle}
                  </Text>
                </Column>
                <Spacer size={6} position="right" />
                <Pressable onPress={() => handleOpenComments()}>
                  <Row alignItems="center" gap={6}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={theme.colors.text}
                    />
                    <Text style={commonStyles.smallText}>
                      {taskCommentCount ?? 0} Comment
                      {taskCommentCount > 1 ? "s" : ""}
                    </Text>
                  </Row>
                </Pressable>
              </Row>

              {task.description && (
                <Text style={commonStyles.smallText}>{task.description}</Text>
              )}
              <Row justifyContent="flex-end" alignItems="center" gap={4}>
                <Text style={[commonStyles.tinyText]}>
                  For {task.assignedTo}
                </Text>
                <AssignedIcon
                  type={task.assignedTo as AssignedTo}
                  color={theme.colors.textLight}
                  size={12}
                />
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
            </Column>
          )
        )}
      </CollapsibleHeaderTabs>

      <CommentsModal
        visible={commentModal.visible}
        onClose={handleCloseComments}
        fetchUrl={
          commentModal.subtaskId
            ? AppUrl.getSubtaskComments(taskId, commentModal.subtaskId)
            : AppUrl.getTaskComments(taskId)
        }
        postUrl={
          commentModal.subtaskId
            ? AppUrl.addSubtaskComment(taskId, commentModal.subtaskId)
            : AppUrl.addTaskComment(taskId)
        }
        entityId={taskId}
        subtask={commentModal.subtaskId}
        setCount={
          commentModal.subtaskId
            ? (count: number) =>
                setSubtaskCommentCounts((prev) => ({
                  ...prev,
                  [commentModal.subtaskId as string]: count,
                }))
            : setTaskCommentCount
        }
      />
    </View>
  );
}
