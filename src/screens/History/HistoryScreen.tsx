import React from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
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
    loadMoreTasks,
    page,
    totalPages,
  } = useCompletedTasksViewModel();

  useFocusEffect(
    React.useCallback(() => {
      // Refresh from page 1 whenever screen gains focus
      fetchCompletedTasks(1);
    }, [])
  );

  const { themeColor } = useHelper();

  const renderFooter = () =>
    page < totalPages ? (
      <View style={{ paddingVertical: theme.spacing.md }}>
        <ActivityIndicator
          size="small"
          color={themeColor.dark ?? theme.colors.primary}
        />
      </View>
    ) : null;

  return (
    <ScreenWrapper title="History">
      <View style={commonStyles.screenWrapper}>
        {tasks.length > 0 ? (
          <>
            <CustomInput
              placeholder="Search here..."
              onChangeText={searchTasks}
            />
            <FlatList
              data={tasks}
              keyExtractor={({ _id }) => _id?.toString()!}
              renderItem={({ item }) => (
                <TasksCard
                  item={item}
                  containerStyle={{ backgroundColor: theme.colors.background }}
                  handleDelete={() => deleteTask(item._id!)}
                  isCompleted
                />
              )}
              refreshing={loading}
              onRefresh={() => fetchCompletedTasks(1)}
              onEndReached={loadMoreTasks}
              onEndReachedThreshold={0.4}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <EmptyState
            text="Nothing to show"
            button={() => fetchCompletedTasks(1)}
            loading={loading}
            error={!!error?.length}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
