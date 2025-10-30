import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, Text, FlatList, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Row, Spacer } from "../../tools";
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
  } = useTaskDetailViewModel(taskId);

  const { formatDate } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = TaskDetailStyles(theme);

  const [commentModal, setCommentModal] = useState<{
    visible: boolean;
    subtaskId?: string;
  }>({
    visible:
      (showComments && (!!commentSubtaskId || commentSubtaskId === "")) ??
      false,
    subtaskId: commentSubtaskId ?? undefined,
  });

  // Store the subtask that was last opened for comments
  const [lastCommentedSubtask, setLastCommentedSubtask] = useState<
    string | null
  >(null);

  // Keep animated scale refs for each subtask
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
    if (lastCommentedSubtask) {
      triggerBounce(lastCommentedSubtask);
    }
  }, [lastCommentedSubtask, triggerBounce]);

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

      const scale = getScaleAnim(item._id);

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
              onPress={() => handleOpenComments(item._id)}
              style={{ marginTop: theme.spacing.sm }}
            >
              <Row alignItems="center" gap={6}>
                <Text style={commonStyles.subTitleText}>
                  {item.totalComments ?? 0}
                </Text>
                <Animated.View style={{ transform: [{ scale }] }}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={30}
                    color={theme.colors.text}
                  />
                </Animated.View>
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
      handleOpenComments,
      getScaleAnim,
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
                  <Pressable onPress={() => handleOpenComments()}>
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
      />
    </View>
  );
}
