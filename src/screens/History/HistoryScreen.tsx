import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useCompletedTasksViewModel } from "./historyViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useFocusEffect } from "@react-navigation/native";
import { useHelper } from "../../utils/helper";
import CustomInput from "../../components/customInput";
import TasksCard from "../../components/tasksCard";

export default function HistoryScreen({ navigation }: any) {
  const {
    tasks,
    loading,
    error,
    fetchCompletedTasks,
    deleteTask,
    searchTasks,
  } = useCompletedTasksViewModel();
  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedTasks();
    }, [])
  );

  const { formatDate, loggedInUser, getPriorityColor } = useHelper();

  const renderTaskCard = ({ item }: { item: any }) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, {
            taskId: item._id,
            readOnly: true,
          })
        }
        onLongPress={
          loggedInUser?.userId === "RehmanK"
            ? () => deleteTask(item._id)
            : () => {}
        }
      >
        <TasksCard item={item} />
      </Pressable>
    );
  };

  return (
    <ScreenWrapper title="History">
      <View style={[commonStyles.screenWrapper]}>
        {tasks.length > 0 ? (
          <>
            <CustomInput
              placeholder="Search here..."
              onChangeText={searchTasks}
            />
            <FlatList
              data={tasks}
              keyExtractor={(item) => item._id}
              renderItem={renderTaskCard}
              onRefresh={fetchCompletedTasks}
              refreshing={loading}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <EmptyState
            text="Nothing to show"
            button={fetchCompletedTasks}
            loading={loading}
            error={!!error?.length}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
