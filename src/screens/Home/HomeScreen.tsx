import { View, FlatList } from "react-native";
import FloatingAdd from "../../components/FloatingAdd";
import { useHomeScreenViewModel } from "./homeViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { useHelper } from "../../utils/helper";
import EmptyState from "../../components/emptyState";
import React, { useEffect } from "react";
import TasksCard from "../../components/tasksCard";
import { Images } from "../../../assets/images/images";
import { useUtilStore } from "../../store/utils";
import { useTheme } from "../../infrastructure/theme";

export default function HomeScreen({ navigation }: any) {
  const { tasks, loading, error, fetchTasks, deleteTask } =
    useHomeScreenViewModel();
  const { loggedInUser, themeColor } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const { fetchingTask } = useUtilStore();
  useEffect(() => {
    fetchTasks();
  }, [fetchingTask]);

  return (
    <ScreenWrapper showImage title={`Hey, ${loggedInUser?.name?.trim()}!`}>
      <View style={[commonStyles.screenWrapper]}>
        {tasks?.length === 0 ? (
          <EmptyState
            text="No active tasks"
            button={fetchTasks}
            loading={loading}
            error={!!error?.length}
            image={Images.noTask}
          />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TasksCard
                item={item}
                containerStyle={{
                  backgroundColor: `${theme.colors.background}`,
                  borderColor: `${
                    themeColor?.light ?? theme.colors.secondary
                  }20`,
                }}
                handleDelete={() => deleteTask(item._id!)}
              />
            )}
            refreshing={loading}
            onRefresh={fetchTasks}
          />
        )}
      </View>
      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_TASK)} />
    </ScreenWrapper>
  );
}
