import { useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { theme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { commonStyles } from "../../styles/commonstyles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ScreenLoader from "../../components/screenLoader";
import { useHelper } from "../../utils/helper";
import ImageModal from "../../components/imageModal";
import Avatar from "../../components/avatar";
import EmptyState from "../../components/emptyState";
import { SubtaskStatus, TaskStatus } from "../../enums/tasks";
import CommentCard from "../../components/commentCard";
import TimeLeftProgress from "../../components/timeLeftProgress";
import { SubtaskComment } from "../../types/task";

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
    subtaskStatusLoading,
  } = useTaskDetailViewModel(taskId);
  const { formatDate, themeColor } = useHelper();
  const [taskComment, setTaskComment] = useState("");
  const [subtaskComments, setSubtaskComments] = useState<
    Record<string, string>
  >({});

  if (error) return <EmptyState text="Retry" button={fetchTaskDetail} error />;

  const renderSubtask = ({
    item,
    createdAt,
  }: {
    item: any;
    createdAt: string;
  }) => (
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
      <Row justifyContent="space-between" alignItems="center">
        <Column gap={6} justifyContent="center" style={commonStyles.fullFlex}>
          <Text style={[commonStyles.basicText]}>{item.title}</Text>
          {item.dueDateTime && (
            <Text style={commonStyles.tTinyText}>
              Due: {formatDate(item.dueDateTime)}
            </Text>
          )}
        </Column>
        {!readOnly && item.status === SubtaskStatus.Pending && (
          <>
            <Spacer size={4} position="right" />
            <Ionicons
              onPress={() =>
                updateSubtaskStatus(item._id, SubtaskStatus.Completed)
              }
              disabled={subtaskStatusLoading === item._id}
              name="checkmark-done-circle"
              size={50}
              color={theme.colors.success}
            />
          </>
        )}
      </Row>
      {!readOnly && item.status === SubtaskStatus.Pending && createdAt && (
        <Row alignItems="center" style={commonStyles.fullFlex}>
          <Text style={commonStyles.tTinyText}>Time left: {} </Text>

          <TimeLeftProgress startTime={createdAt} endTime={item?.dueDateTime} />
        </Row>
      )}
      {/* Subtask Comments */}
      <View style={{ marginTop: theme.spacing.sm }}>
        {item?.comments?.map((c: SubtaskComment, idx: number) => {
          const prev = item?.comments?.[idx - 1];
          const sameUser = idx > 0 && c?.createdBy === prev?.createdBy;

          return (
            <CommentCard
              key={idx}
              image={c?.createdByDetails?.image}
              text={c?.text}
              name={c?.createdByDetails?.name ?? c?.createdBy}
              userId={c?.createdBy}
              time={formatDate(c?.createdAt!)}
              repeated={sameUser}
            />
          );
        })}

        {!readOnly && item.status !== "Completed" && (
          <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
            <CustomInput
              placeholder="Add comment..."
              value={subtaskComments[item._id] || ""}
              onChangeText={(text) =>
                setSubtaskComments({ ...subtaskComments, [item._id]: text })
              }
              fullFlex
              multiline
              rounded
              inputStyle={{
                minHeight: 40,
                textAlignVertical: "center",
              }}
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
              loading={subtaskCommentLoading === item._id}
            />
          </View>
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
              {task?.image && <ImageModal disabled defaultImage={task.image} />}
              <Column gap={isAndroid ? 5 : 6}>
                <Text style={commonStyles.subTitleText}>{task?.title}</Text>
                {task?.description && (
                  <Text style={commonStyles.smallText}>
                    {task?.description}
                  </Text>
                )}
                <Row justifyContent="space-between">
                  <Row alignItems="center">
                    <Text style={commonStyles.tTinyText}>Creator: </Text>
                    <Avatar
                      name={
                        task?.createdByDetails
                          ? task.createdByDetails.name.split(" ")[0]
                          : task?.createdBy
                      }
                      image={task?.createdByDetails?.image}
                      withName
                    />
                  </Row>
                  <Text style={commonStyles.tinyText}>
                    Assigned To: {task?.assignedTo}
                  </Text>
                </Row>
                {task?.subtasks?.length > 0 && (
                  <View
                    style={[
                      commonStyles.secondaryContainer,
                      {
                        backgroundColor: `${themeColor.light}20`,
                      },
                    ]}
                  >
                    <Text style={commonStyles.basicText}>Subtasks</Text>
                    <FlatList
                      data={task?.subtasks}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) =>
                        renderSubtask({ item, createdAt: task?.createdAt })
                      }
                      scrollEnabled={false}
                    />
                  </View>
                )}
                {task?.comments?.length > 0 && (
                  <View
                    style={[
                      commonStyles.secondaryContainer,
                      {
                        backgroundColor: `${themeColor.light}20`,
                      },
                    ]}
                  >
                    <Text style={commonStyles.basicText}>Task Comments</Text>
                    <Spacer size={16} />
                    {task?.comments?.map((c: any, idx: number) => {
                      const prev = task?.comments?.[idx - 1];
                      const sameUser =
                        idx > 0 &&
                        (c?.createdBy ?? c?.by) ===
                          (prev?.createdBy ?? prev?.by);
                      return (
                        <CommentCard
                          key={c._id ?? idx}
                          image={c?.createdByDetails?.image}
                          text={c?.text}
                          name={
                            c?.createdByDetails?.name ?? c?.createdBy ?? c?.by
                          }
                          userId={c?.createdBy ?? c?.by}
                          time={formatDate(c?.date)}
                          repeated={sameUser}
                        />
                      );
                    })}
                  </View>
                )}
                {/* {!readOnly && ( */}
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
                    multiline
                    inputStyle={{
                      minHeight: 40,
                      textAlignVertical: "center",
                    }}
                    rounded
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
                {/* // )} */}
              </Column>
            </KeyboardAwareScrollView>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
