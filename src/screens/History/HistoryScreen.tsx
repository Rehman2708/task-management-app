import React, { useEffect } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useCompletedTasksViewModel } from "./historyViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import EmptyState from "../../components/emptyState";
import { useHelper } from "../../utils/helper";
import CustomInput from "../../components/customInput";
import TasksCard from "../../components/tasksCard";
import { theme } from "../../infrastructure/theme";
import { Images } from "../../../assets/images/images";
import { useUtilStore } from "../../store/utils";

export default function HistoryScreen({ navigation }: any) {
  const {
    tasks,
    initialLoading,
    loadingMore,
    error,
    fetchCompletedTasks,
    deleteTask,
    searchTasks,
    loadMoreTasks,
    page,
    totalPages,
    toggleSearch,
    showSearch,
  } = useCompletedTasksViewModel();
  const { fetchingHistory } = useUtilStore();

  useEffect(() => {
    fetchCompletedTasks(1, true);
  }, [fetchingHistory]);

  const { themeColor } = useHelper();

  const renderFooter = () =>
    loadingMore && page < totalPages ? (
      <View style={{ paddingVertical: theme.spacing.md }}>
        <ActivityIndicator
          size="small"
          color={themeColor.dark ?? theme.colors.primary}
        />
      </View>
    ) : null;

  return (
    <ScreenWrapper title="History" onSearchPress={toggleSearch}>
      <View style={commonStyles.screenWrapper}>
        {tasks?.length > 0 ? (
          <>
            {showSearch && (
              <CustomInput
                placeholder="Search here..."
                onChangeText={searchTasks}
              />
            )}
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
              refreshing={initialLoading}
              onRefresh={() => fetchCompletedTasks(1, true)}
              onEndReached={loadMoreTasks}
              onEndReachedThreshold={0.4}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <EmptyState
            text="Nothing to show"
            button={() => fetchCompletedTasks(1, true)}
            loading={initialLoading}
            error={!!error?.length}
            image={Images.noTask}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
