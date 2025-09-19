import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import FloatingAdd from "../../components/FloatingAdd";
import { useHomeScreenViewModel } from "./homeViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import { useHelper } from "../../utils/helper";
import EmptyState from "../../components/emptyState";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import TasksCard from "../../components/tasksCard";

export default function HomeScreen({ navigation }: any) {
  const { tasks, loading, error, fetchTasks, deleteTask } =
    useHomeScreenViewModel();
  const { loggedInUser, themeColor, formatDate, getPriorityColor } =
    useHelper();
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );
  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, { taskId: item._id })
        }
        onLongPress={() => deleteTask(item._id)}
      >
        <TasksCard
          item={item}
          containerStyle={{
            backgroundColor: `${themeColor?.light ?? theme.colors.secondary}20`,
            borderColor: `${themeColor?.light ?? theme.colors.secondary}20`,
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper title={`Hey, ${loggedInUser?.name?.trim()}!`}>
      <View style={[commonStyles.screenWrapper]}>
        {tasks.length === 0 ? (
          <EmptyState
            text="No active tasks"
            button={fetchTasks}
            loading={loading}
            error={!!error?.length}
          />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={fetchTasks}
          />
        )}
      </View>
      <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_TASK)} />
    </ScreenWrapper>
  );
}
