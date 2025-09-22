import React from "react";
import { View, FlatList } from "react-native";
import { useCompletedTasksViewModel } from "./historyViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import EmptyState from "../../components/emptyState";
import { useFocusEffect } from "@react-navigation/native";
import { useHelper } from "../../utils/helper";
import CustomInput from "../../components/customInput";
import TasksCard from "../../components/tasksCard";
import { theme } from "../../infrastructure/theme";

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

  const {} = useHelper();

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
              renderItem={({ item }) => (
                <TasksCard
                  item={item}
                  containerStyle={{
                    backgroundColor: `${theme.colors.background}`,
                  }}
                  handleDelete={() => deleteTask(item._id!)}
                  isCompleted
                />
              )}
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
