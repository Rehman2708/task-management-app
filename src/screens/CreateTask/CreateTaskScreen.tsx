import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Button,
  Platform,
} from "react-native";
import { useCreateTaskViewModel } from "./createViewModel";
import { styles } from "./styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import CustomButton from "../../components/customButton";
import CustomInput from "../../components/customInput";
import { Row, Spacer } from "../../tools";
import { theme } from "../../infrastructure/theme";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AndroidDateTimePicker } from "./components/subtaskItem";
// Pass `task` prop for edit mode
export const CreateTaskScreen = ({ route, navigation }: any) => {
  const { task } = route.params || {};
  const vm = useCreateTaskViewModel(task);

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
      navigation.goBack();
    }
  };

  return (
    <ScreenWrapper
      title="Create Task"
      showBackbutton
      subTitle="Home > Create Task"
    >
      <View style={[commonStyles.screenWrapper]}>
        <KeyboardAwareScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <CustomInput
            title="Enter task title"
            value={vm.title}
            onChangeText={vm.setTitle}
          />
          <CustomInput
            title="Enter description"
            value={vm.description}
            onChangeText={vm.setDescription}
          />

          <Text style={commonStyles.smallText}>Assigned To</Text>
          <Row gap={16} alignItems="center">
            {["Me", "Partner", "Both"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => vm.setAssignedTo(option as any)}
                style={[
                  styles.assignButton,
                  vm.assignedTo === option
                    ? styles.assignButtonActive
                    : styles.assignButtonInactive,
                ]}
              >
                <Text
                  style={[
                    commonStyles.smallText,
                    vm.assignedTo === option
                      ? styles.assignTextActive
                      : styles.assignTextInactive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </Row>

          <Text style={commonStyles.smallText}>Frequency</Text>
          <Row gap={16} alignItems="center">
            {["Once", "Daily", "Weekly"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => vm.setFrequency(option as any)}
                style={[
                  styles.assignButton,
                  vm.frequency === option
                    ? styles.assignButtonActive
                    : styles.assignButtonInactive,
                ]}
              >
                <Text
                  style={[
                    commonStyles.smallText,
                    vm.frequency === option
                      ? styles.assignTextActive
                      : styles.assignTextInactive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </Row>

          <Text style={commonStyles.smallText}>Priority</Text>
          <Row gap={16} alignItems="center">
            {["Low", "High", "Urgent"].map((option) => (
              <TouchableOpacity
                style={[
                  styles.assignButton,
                  vm.priority === option
                    ? styles.assignButtonActive
                    : styles.assignButtonInactive,
                ]}
                key={option}
                onPress={() => vm.setPriority(option as any)}
              >
                <Text
                  style={[
                    commonStyles.smallText,
                    vm.priority === option
                      ? styles.assignTextActive
                      : styles.assignTextInactive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </Row>
          <Text style={styles.label}>Subtasks</Text>
          {vm.subtasks.map((subtask, index) => (
            <View key={index} style={commonStyles.cardContainer}>
              <CustomInput
                title="Subtask title"
                value={subtask.title}
                onChangeText={(text) => vm.updateSubtask(index, "title", text)}
              />
              <Row gap={6} alignItems="center">
                <Text style={commonStyles.smallText}>Due:</Text>

                {Platform.OS === "ios" ? (
                  // iOS: Inline picker
                  <DateTimePicker
                    value={subtask.dueDateTime}
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
                    dueDateTime={subtask.dueDateTime}
                    onChange={(date) =>
                      vm.updateSubtask(index, "dueDateTime", date)
                    }
                  />
                )}
              </Row>
              <Row justifyContent="flex-end">
                {vm.subtasks.length > 1 && (
                  <CustomButton
                    small
                    title="Remove"
                    error
                    onPress={() => vm.removeSubtask(index)}
                    halfWidth
                    rounded
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
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </Row>

          {vm.error && <Text style={commonStyles.errorText}>{vm.error}</Text>}
          <Spacer size={50} />
        </KeyboardAwareScrollView>
        <CustomButton
          loading={vm.loading}
          onPress={handleSave}
          title={task ? "Update Task" : "Create Task"}
        />
      </View>
    </ScreenWrapper>
  );
};
