import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Animated,
  DeviceEventEmitter,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Row, Spacer } from "../../tools";
import { useHelper } from "../../utils/helper";
import { SubtaskStatus, TaskStatus } from "../../enums/tasks";
import { AppUrl } from "../../utils/appUrl";
import { useAuthStore } from "../../store/authStore";

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
import AlertModal from "../../components/AlertModal";
import { ROUTES } from "../../enums/routes";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function TaskDetailScreen({ route }: any) {
  const {
    taskId,
    readOnly = false,
    showComments,
    commentSubtaskId,
  } = route.params;

  const { user } = useAuthStore();
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
    loading,
    showAlert,
    setShowAlert,
    handleDeleteTask,
  } = useTaskDetailViewModel(taskId);
  const navigation: any = useNavigation();
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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTaskDetail();
    }, [fetchTaskDetail])
  );

  // Listen for notification events to open comment modal
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "openCommentModal",
      (eventData) => {
        if (eventData?.isComment || eventData?.isGrouped) {
          setCommentModal({
            visible: true,
            subtaskId: eventData?.commentSubtaskId ?? undefined,
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

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
          : item.status === SubtaskStatus.PartiallyComplete
          ? `${theme.colors.warning}20`
          : `${theme.colors.error}20`;
      const borderColor =
        item.status === SubtaskStatus.Completed
          ? `${theme.colors.success}40`
          : item.status === SubtaskStatus.PartiallyComplete
          ? `${theme.colors.warning}40`
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

      // Check if current user can complete this subtask
      const canComplete = (() => {
        // If subtask has its own assignment, use that
        if (item.assignedTo) {
          if (item.assignedTo === "Both") {
            // For "Both" assignments, check if current user hasn't completed yet
            return !item.completedBy?.includes(user?.userId || "");
          }
          if (item.assignedTo === "Me" && task?.ownerUserId === user?.userId)
            return true;
          if (
            item.assignedTo === "Partner" &&
            task?.ownerUserId !== user?.userId
          )
            return true;
          return false;
        }

        // Fallback to task-level assignment (legacy tasks)
        if (task?.assignedTo) {
          if (task.assignedTo === "Both") return true; // Both can complete any subtask
          if (task.assignedTo === "Me" && task?.ownerUserId === user?.userId)
            return true;
          if (
            task.assignedTo === "Partner" &&
            task?.ownerUserId !== user?.userId
          )
            return true;
          return false;
        }

        // Default fallback for very old tasks with no assignment info
        return true;
      })();

      // Get completion status for "Both" assignments
      const getCompletionStatus = () => {
        if (item.assignedTo !== "Both" || !item.completedBy) return null;

        const ownerCompleted = item.completedBy.includes(
          task?.ownerUserId || ""
        );
        const partnerCompleted = item.completedBy.some(
          (id) => id !== task?.ownerUserId
        );

        if (ownerCompleted && partnerCompleted) return "Both completed";
        if (ownerCompleted) return "Owner completed";
        if (partnerCompleted) return "Partner completed";
        return null;
      };

      const completionStatus = getCompletionStatus();

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
                <Row alignItems="center" justifyContent="space-between">
                  <Text style={[commonStyles.basicText, commonStyles.fullFlex]}>
                    {item.title}
                  </Text>
                  {/* Show subtask assignment if it exists, otherwise show task-level assignment */}
                  {(item.assignedTo || task?.assignedTo) && (
                    <Row alignItems="center" gap={4}>
                      <AssignedIcon
                        type={item.assignedTo || task?.assignedTo || "Me"}
                        size={14}
                        color={theme.colors.textLight}
                      />
                      <Text
                        style={[
                          commonStyles.tTinyText,
                          { color: theme.colors.textLight },
                        ]}
                      >
                        {item.assignedTo
                          ? item.assignedTo
                          : `Task: ${task?.assignedTo}`}
                      </Text>
                    </Row>
                  )}
                </Row>

                {/* Show completion status for "Both" assignments */}
                {item.status === SubtaskStatus.PartiallyComplete &&
                  completionStatus && (
                    <Text
                      style={[
                        commonStyles.tTinyText,
                        { color: theme.colors.warning, fontStyle: "italic" },
                      ]}
                    >
                      📋 {completionStatus}
                    </Text>
                  )}

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
              (item.status === SubtaskStatus.Pending ||
                item.status === SubtaskStatus.PartiallyComplete) &&
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

              {!readOnly &&
                (item.status === SubtaskStatus.Pending ||
                  item.status === SubtaskStatus.PartiallyComplete) &&
                (canComplete ? (
                  <CustomButton
                    onPress={() => handleUpdateStatus(item._id)}
                    iconName="checkmark-done-outline"
                    title={
                      item.status === SubtaskStatus.PartiallyComplete
                        ? "Complete My Part"
                        : "Complete"
                    }
                    sendButton
                    loading={subtaskStatusLoading === item._id}
                    success
                  />
                ) : (
                  <Text
                    style={[
                      commonStyles.tTinyText,
                      { color: theme.colors.textLight, fontStyle: "italic" },
                    ]}
                  >
                    {item.assignedTo === "Both" &&
                    item.completedBy?.includes(user?.userId || "")
                      ? "You completed this"
                      : item.assignedTo
                      ? "Not assigned to you"
                      : task?.assignedTo && task.assignedTo !== "Both"
                      ? `Task assigned to ${task.assignedTo}`
                      : "Not assigned to you"}
                  </Text>
                ))}
            </Row>
          </Column>
        </AnimatedListItem>
      );
    },
    [
      theme,
      commonStyles,
      hasMultipleDates,
      task?.createdAt,
      task?.ownerUserId,
      user?.userId,
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
        subTitle={formatDate(task?.createdAt as string)}
        menuItem={[
          {
            title: `${
              task?.status === TaskStatus.Completed ? "Repeat" : "Edit"
            } Task`,
            onPress: () =>
              navigation.navigate(ROUTES.CREATE_TASK, {
                task: task,
                repeat: task?.status === TaskStatus.Completed,
              }),
          },
          {
            title: "Delete Task",
            onPress: () => setShowAlert(true),
            error: true,
          },
        ]}
      >
        {error || taskDetailLoading ? (
          <EmptyState
            type={LoaderTypes.TaskDetailScreen}
            text="🔄 Retry"
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
                  {/* Show task-level assignment if it exists (legacy tasks) */}
                  {task.assignedTo && (
                    <Row alignItems="center" gap={6} style={{ marginTop: 4 }}>
                      <AssignedIcon
                        type={task.assignedTo}
                        size={14}
                        color={theme.colors.textLight}
                      />
                      <Text
                        style={[
                          commonStyles.tinyText,
                          { color: theme.colors.textLight },
                        ]}
                      >
                        Task assigned to: {task.assignedTo}
                      </Text>
                    </Row>
                  )}
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
              {task?.subtasks?.length && task.subtasks.length > 0 && (
                <View style={styles.container}>
                  <Text style={commonStyles.subTitleText}>📋 Subtasks</Text>
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
      <AlertModal
        isVisible={showAlert}
        loading={loading}
        onClose={() => setShowAlert(false)}
        onConfirm={handleDeleteTask}
        title={"🗑️ Delete Task"}
        subTitle={"Are you sure you want to delete this task?"}
        error
      />
    </View>
  );
}
