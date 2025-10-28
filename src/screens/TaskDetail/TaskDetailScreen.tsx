import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { theme } from "../../infrastructure/theme";
import { useTaskDetailViewModel } from "./taskDetailViewModel";
import { commonStyles } from "../../styles/commonstyles";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import ScreenLoader from "../../components/screenLoader";
import { useHelper } from "../../utils/helper";
import Avatar from "../../components/avatar";
import EmptyState from "../../components/emptyState";
import { SubtaskStatus } from "../../enums/tasks";
import CommentCard from "../../components/commentCard";
import TimeLeftProgress from "../../components/timeLeftProgress";
import { SubtaskComment } from "../../types/task";
import CollapsibleHeaderTabs from "../../components/collapsibleHeader";

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
  const [showImage, setShowImage] = useState(false);
  const [subtaskComments, setSubtaskComments] = useState<
    Record<string, string>
  >({});
  const [showAllTaskComments, setShowAllTaskComments] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<
    Record<string, boolean>
  >({});

  const taskCommentsRef = useRef<FlatList>(null);
  useEffect(() => {
    if (task?.comments?.length) {
      taskCommentsRef.current?.scrollToEnd({ animated: true });
    }
  }, [task?.comments?.length]);

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
            <CustomButton
              onPress={() =>
                updateSubtaskStatus(item._id, SubtaskStatus.Completed)
              }
              iconName="checkmark-done-outline"
              title="Send"
              sendButton
              loading={subtaskStatusLoading === item._id}
              success
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
        {item?.comments?.length > 0 && (
          <Row justifyContent="space-between" alignItems="center">
            <Text style={commonStyles.basicText}>Comments</Text>
            {item.comments.length > 5 && (
              <Pressable
                onPress={() =>
                  setExpandedSubtasks((prev) => ({
                    ...prev,
                    [item._id]: !prev[item._id],
                  }))
                }
              >
                <Text
                  style={[
                    commonStyles.tinyText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {expandedSubtasks[item._id] ? "Hide" : "Show all"}
                </Text>
              </Pressable>
            )}
          </Row>
        )}

        {(expandedSubtasks[item._id]
          ? item.comments
          : item.comments?.slice(-5)
        )?.map((c: SubtaskComment, idx: number) => {
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
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <CollapsibleHeaderTabs
        title={task?.title ?? "Task"}
        subTitle={formatDate(task?.createdAt)}
        headerImage={task?.image}
      >
        {error ? (
          <EmptyState text="Retry" button={fetchTaskDetail} error />
        ) : (
          <>
            {loading ? (
              <ScreenLoader />
            ) : (
              <>
                {task && (
                  <>
                    <Column gap={isAndroid ? 5 : 6}>
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
                          <Spacer size={8} />
                          <FlatList
                            data={task?.subtasks}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) =>
                              renderSubtask({
                                item,
                                createdAt: task?.createdAt,
                              })
                            }
                            scrollEnabled={false}
                            keyboardShouldPersistTaps="always"
                          />
                        </View>
                      )}
                      {task?.comments?.length > 0 && (
                        <View
                          style={[
                            commonStyles.secondaryContainer,
                            { backgroundColor: `${themeColor.light}20` },
                          ]}
                        >
                          <Row
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text style={commonStyles.basicText}>
                              Task Comments
                            </Text>
                            {task.comments.length > 10 && (
                              <Pressable
                                onPress={() =>
                                  setShowAllTaskComments((prev) => !prev)
                                }
                              >
                                <Text
                                  style={[
                                    commonStyles.tinyText,
                                    { color: theme.colors.primary },
                                  ]}
                                >
                                  {showAllTaskComments ? "Hide" : "Show all"}
                                </Text>
                              </Pressable>
                            )}
                          </Row>
                          <Spacer size={12} />

                          <FlatList
                            ref={taskCommentsRef}
                            data={
                              showAllTaskComments
                                ? task.comments
                                : task.comments.slice(-10)
                            }
                            keyExtractor={(item, index) =>
                              item._id ?? index.toString()
                            }
                            renderItem={({ item, index }) => {
                              const prev = task.comments[index - 1];
                              const sameUser =
                                index > 0 &&
                                (item?.createdBy ?? item?.by) ===
                                  (prev?.createdBy ?? prev?.by);

                              return (
                                <CommentCard
                                  image={item?.createdByDetails?.image}
                                  text={item?.text}
                                  name={
                                    item?.createdByDetails?.name ??
                                    item?.createdBy ??
                                    item?.by
                                  }
                                  userId={item?.createdBy ?? item?.by}
                                  time={formatDate(item?.date)}
                                  repeated={sameUser}
                                />
                              );
                            }}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                          />
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
                  </>
                )}
              </>
            )}
          </>
        )}
      </CollapsibleHeaderTabs>
    </View>
  );
}
