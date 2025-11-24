import React, { useEffect, useCallback, useMemo } from "react";
import { View, FlatList, Pressable, Text } from "react-native";
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
import { Row, Spacer } from "../../tools";
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
    taskImages,
  } = useHomeScreenViewModel();

  const { loggedInUser, themeColor } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { fetchingTask } = useUtilStore();

  // 🔥 Always fresh data on tab change or when new task created
  useEffect(() => {
    fetchTasks(1, true);
  }, [fetchingTask, tab]);

  // 🔥 Memoized tabs
  const tabs = useMemo(
    () => [
      { title: "Active", value: "Active" as const },
      { title: "History", value: "History" as const },
    ],
    []
  );

  // Memoized renderItem
  const renderItem = useCallback(
    ({ item }: any) => (
      <TasksCard
        item={item}
        handleDelete={() => deleteTask(item._id!)}
        isCompleted={tab === "History"}
      />
    ),
    [tab, deleteTask]
  );

  // Footer Loader
  const renderFooter = useCallback(() => {
    if (tab === "History" && loadingMore) {
      return <ScreenLoader type={LoaderTypes.TaskScreen} count={5} />;
    }
    return <Spacer size={100} />;
  }, [loadingMore, tab]);

  return (
    <ScreenWrapper
      image={taskImages}
      showImage
      title={`Hey, ${loggedInUser?.name?.trim()}!`}
    >
      {/* Tabs */}
      <Row>
        {tabs.map((item) => (
          <Pressable
            key={item.value}
            style={[commonStyles.fullFlex, { paddingVertical: 10 }]}
            onPress={() => setTab(item.value)}
          >
            <Text
              style={[
                commonStyles.basicText,
                {
                  textAlign: "center",
                  color:
                    tab === item.value ? themeColor.dark : theme.colors.text,
                  borderBottomWidth: tab === item.value ? 2 : 0,
                  borderBottomColor:
                    tab === item.value ? themeColor.dark : "transparent",
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
        {/* Empty / Loader */}
        {loading || tasks.length === 0 ? (
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
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={() => fetchTasks(1, true)}
            onEndReached={tab === "History" ? loadMoreTasks : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={8}
          />
        )}
      </View>

      {tab === "Active" && (
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_TASK)} />
      )}
    </ScreenWrapper>
  );
}
