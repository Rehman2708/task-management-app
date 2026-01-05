import { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useCreateTaskViewModel } from "./createViewModel";
import { createTaskStyle } from "./styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import { isAndroid, Row, Spacer } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AndroidDateTimePicker, AssignedIcon } from "./components/subtaskItem";
import { useHelper } from "../../utils/helper";
import ImageModal from "../../components/imageModal";
import { Priority, TaskStatus } from "../../enums/tasks";
import { useTheme } from "../../infrastructure/theme";
import { ROUTES } from "../../enums/routes";
// Pass `task` prop for edit mode
export const CreateTaskScreen = ({ route, navigation }: any) => {
  const { task, repeat } = route.params || {};
  const vm = useCreateTaskViewModel(task, repeat);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const styles = createTaskStyle(theme);
  const { themeColor, getPriorityColor, loggedInUser } = useHelper();

  useEffect(() => {
    if (task) {
      navigation.setOptions({ title: "Edit Task" });
    } else {
      navigation.setOptions({ title: "Create Task" });
    }
  }, [task]);

  const handleSave = async () => {
    const res = await vm.saveTask();
    if (res) {
      navigation.reset({
        index: 1,
        routes: [
          { name: ROUTES.TABS },
          { name: ROUTES.TASK_DETAIL, params: { taskId: res._id } },
        ],
      });
    }
  };
  return (
    <ScreenWrapper
      title={`${
        task
          ? task?.status === TaskStatus.Completed
            ? "✏️ Create"
            : "➕ Edit"
          : "➕ Create"
      } Task`}
      showBackbutton
      image={vm.image.length ? vm.image : undefined}
      noPadding
      // subTitle={task ? "Edit" : "Home > Create Task"}
    >
      <View style={[commonStyles.screenWrapper]}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <ImageModal onChange={vm.setImage} defaultImage={vm.image} />
          <CustomInput
            title="📝 Enter task title"
            value={vm.title}
            onChangeText={vm.setTitle}
          />
          <CustomInput
            title="📄 Enter description"
            value={vm.description}
            onChangeText={vm.setDescription}
            multiline
          />

          <Text style={commonStyles.smallText}>🚨 Priority</Text>
          <Row gap={isAndroid ? 14 : 16} alignItems="center">
            {["Low", "High", "Urgent"].map((option) => (
              <TouchableOpacity
                style={[
                  styles.assignButton,
                  vm.priority === option
                    ? {
                        backgroundColor: getPriorityColor(option as Priority),
                        borderColor: getPriorityColor(option as Priority),
                      }
                    : {
                        borderColor: getPriorityColor(option as Priority),
                      },
                ]}
                key={option}
                onPress={() => vm.setPriority(option as any)}
              >
                <Text
                  style={[
                    commonStyles.smallText,
                    vm.priority === option
                      ? { color: theme.colors.white }
                      : {
                          color: getPriorityColor(option as Priority),
                        },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </Row>
          <Text style={styles.label}>📋 Subtasks</Text>
          {vm.subtasks?.map((subtask, index) => (
            <View key={index} style={commonStyles.cardContainer}>
              <CustomInput
                title="✅ Subtask title"
                value={subtask?.title}
                onChangeText={(text) => vm.updateSubtask(index, "title", text)}
                maxLength={50}
              />

              {/* Subtask Assignment */}
              {loggedInUser?.partner?.userId && (
                <>
                  <Text style={[commonStyles.smallText, { marginTop: 8 }]}>
                    👤 Assigned to
                  </Text>
                  <Row
                    gap={isAndroid ? 8 : 10}
                    alignItems="center"
                    style={{ marginBottom: 8 }}
                  >
                    {["Me", "Partner", "Both"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() =>
                          vm.updateSubtask(
                            index,
                            "assignedTo",
                            option as "Me" | "Partner" | "Both"
                          )
                        }
                        style={[
                          styles.assignButton,
                          (subtask?.assignedTo ||
                            (loggedInUser?.partner?.userId ? "Both" : "Me")) ===
                          option
                            ? styles.assignButtonActive
                            : styles.assignButtonInactive,
                          { paddingHorizontal: 8, paddingVertical: 4 },
                        ]}
                      >
                        <Row gap={4} alignItems="center">
                          <AssignedIcon
                            type={option as "Me" | "Partner" | "Both"}
                            size={12}
                            color={
                              (subtask?.assignedTo ||
                                (loggedInUser?.partner?.userId
                                  ? "Both"
                                  : "Me")) === option
                                ? theme.colors.white
                                : themeColor.dark
                            }
                          />
                          <Text
                            style={[
                              commonStyles.smallText,
                              { fontSize: 11 },
                              (subtask?.assignedTo ||
                                (loggedInUser?.partner?.userId
                                  ? "Both"
                                  : "Me")) === option
                                ? styles.assignTextActive
                                : styles.assignTextInactive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Row>
                      </TouchableOpacity>
                    ))}
                  </Row>
                </>
              )}

              <Row justifyContent="space-between" alignItems="center">
                <Row gap={isAndroid ? 5 : 6} alignItems="center">
                  <Text style={commonStyles.smallText}>📅 Due:</Text>

                  {Platform.OS === "ios" ? (
                    // iOS: Inline picker
                    <DateTimePicker
                      value={subtask?.dueDateTime as unknown as Date}
                      mode="datetime"
                      display="default"
                      onChange={(_, date) => {
                        if (date) vm.updateSubtask(index, "dueDateTime", date);
                      }}
                      minimumDate={new Date(Date.now() + 60 * 60 * 1000)}
                    />
                  ) : (
                    // Android: Show buttons instead of picker directly
                    <AndroidDateTimePicker
                      dueDateTime={subtask?.dueDateTime as unknown as Date}
                      onChange={(date) =>
                        vm.updateSubtask(index, "dueDateTime", date)
                      }
                    />
                  )}
                </Row>
                {vm.subtasks?.length > 1 && (
                  <CustomButton
                    small
                    title="Remove"
                    error
                    onPress={() => vm.removeSubtask(index)}
                    halfWidth
                    rounded
                    customStyle={{ maxWidth: 80, height: 30 }}
                  />
                )}
              </Row>
            </View>
          ))}
          <Row justifyContent="center">
            <TouchableOpacity onPress={vm.addSubtask}>
              <Ionicons
                name="add-circle-outline"
                size={40}
                color={themeColor?.dark ?? theme.colors.primary}
              />
            </TouchableOpacity>
          </Row>

          {vm.error && <Text style={commonStyles.errorText}>{vm.error}</Text>}
          <Spacer size={50} />
        </KeyboardAwareScrollView>
        <CustomButton
          loading={vm.loading}
          onPress={handleSave}
          title={task && !repeat ? "✏️ Update Task" : "➕ Create Task"}
        />
      </View>
    </ScreenWrapper>
  );
};
