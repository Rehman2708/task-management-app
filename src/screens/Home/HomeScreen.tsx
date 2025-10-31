import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import FloatingAdd from "../../components/FloatingAdd";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { useHelper } from "../../utils/helper";
import EmptyState from "../../components/emptyState";
import TasksCard from "../../components/tasksCard";
import { Images } from "../../../assets/images/images";
import { useTheme } from "../../infrastructure/theme";
import { useUtilStore } from "../../store/utils";
import { Row } from "../../tools";
import { useHomeScreenViewModel } from "./homeViewModel";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";

export default function HomeScreen({ navigation }: any) {
  const {
    tasks,
    loading,
    loadingMore,
    error,
    fetchTasks,
    loadMoreTasks,
    deleteTask,
    tab,
    setTab,
  } = useHomeScreenViewModel();

  const { loggedInUser, themeColor } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { fetchingTask } = useUtilStore();

  useEffect(() => {
    fetchTasks(1, true);
  }, [fetchingTask, tab]);

  const tabs = [
    { title: "Active", onPress: () => setTab("Active") },
    { title: "History", onPress: () => setTab("History") },
  ];

  const renderFooter = () =>
    tab === "History" && loadingMore ? (
      <ScreenLoader type={LoaderTypes.TaskScreen} count={4} />
    ) : null;

  return (
    <ScreenWrapper showImage title={`Hey, ${loggedInUser?.name?.trim()}!`}>
      {/* Tabs */}
      <Row>
        {tabs.map((item, index) => (
          <Pressable
            key={index}
            style={[commonStyles.fullFlex, { paddingVertical: 10 }]}
            onPress={item.onPress}
          >
            <Text
              style={[
                commonStyles.basicText,
                {
                  textAlign: "center",
                  color:
                    tab === item.title ? themeColor.dark : theme.colors.text,
                  borderBottomWidth: tab === item.title ? 2 : 0,
                  borderBottomColor:
                    tab === item.title ? themeColor.dark : "transparent",
                  paddingBottom: 6,
                },
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        ))}
      </Row>

      <View style={[commonStyles.screenWrapper]}>
        {/* Empty State */}
        {tasks?.length === 0 || loading ? (
          <EmptyState
            text={tab === "Active" ? "No active tasks" : "Nothing to show"}
            button={() => fetchTasks(1, true)}
            loading={loading}
            error={!!error?.length}
            image={Images.noTask}
            type={LoaderTypes.TaskScreen}
          />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => String(item._id)}
            renderItem={({ item }) => (
              <TasksCard
                item={item}
                containerStyle={{
                  backgroundColor: theme.colors.background,
                  borderColor: `${
                    themeColor?.light ?? theme.colors.secondary
                  }20`,
                }}
                handleDelete={() => deleteTask(item._id!)}
                isCompleted={tab === "History"}
              />
            )}
            refreshing={loading}
            onRefresh={() => fetchTasks(1, true)}
            onEndReached={tab === "History" ? loadMoreTasks : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      {tab === "Active" && (
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_TASK)} />
      )}
    </ScreenWrapper>
  );
}
