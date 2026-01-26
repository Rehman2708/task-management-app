import React, { useEffect, useCallback, useMemo } from "react";
import { View, FlatList, Pressable, Text, RefreshControl } from "react-native";
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
import AnimatedListItem from "../../components/animatedListItem";
import { Task } from "../../types/task";
import AlertModal from "../../components/AlertModal";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../../components/customInput";

export default function HomeScreen({ navigation }: any) {
  const {
    tasks,
    loading,
    loadingMore,
    error,
    fetchTasks,
    loadMoreTasks,
    showAlert,
    setShowAlert,
    handleDeleteTask,
    tab,
    setTab,
    taskImages,
    pageSize,
    // Search functionality
    searchQuery,
    handleSearch,
    searching,
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
      { title: "⚡ Active", value: "Active" as const },
      { title: "📚 History", value: "History" as const },
    ],
    [],
  );

  // Memoized renderItem
  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => {
      const animate = index < pageSize;
      return (
        <AnimatedListItem index={index} animate={animate}>
          <TasksCard
            item={item}
            handleDelete={() => setShowAlert(item._id)}
            isCompleted={tab === "History"}
          />
          <AlertModal
            isVisible={showAlert === item._id}
            loading={loading}
            onClose={() => setShowAlert(undefined)}
            onConfirm={() => handleDeleteTask(item._id!)}
            title={"🗑️ Delete Task"}
            subTitle={"Are you sure you want to delete this task?"}
            error
          />
        </AnimatedListItem>
      );
    },
    [tab, handleDeleteTask, loadingMore],
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
      noPadding
    >
      <Row
        style={{
          alignItems: "flex-end",
          paddingHorizontal: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          {/* Tabs */}
          <Row>
            {tabs.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  commonStyles.fullFlex,
                  { paddingBottom: 10, paddingTop: 4 },
                ]}
                onPress={() => setTab(item.value)}
              >
                <Text
                  style={[
                    commonStyles.basicText,
                    {
                      textAlign: "center",
                      color:
                        tab === item.value
                          ? themeColor.dark
                          : theme.colors.text,
                      borderBottomWidth: tab === item.value ? 2 : 0,
                      borderBottomColor:
                        tab === item.value ? themeColor.dark : "transparent",
                      height: 30,
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </Row>
        </View>
      </Row>
      <View style={[commonStyles.screenWrapper]}>
        <CustomInput
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChangeText={handleSearch}
          showClearIcon
        />
        {searching && (
          <Text
            style={[
              commonStyles.smallText,
              {
                textAlign: "center",
                marginTop: 4,
                marginBottom: 12,
              },
            ]}
          >
            Searching...
          </Text>
        )}
        {/* Empty / Loader */}
        {loading || tasks.length === 0 ? (
          <EmptyState
            text={
              searchQuery.trim()
                ? "🔍 No tasks found"
                : tab === "Active"
                  ? "📝 No active tasks"
                  : "📭 Nothing to show"
            }
            button={() => fetchTasks(1, true)}
            loading={loading}
            error={!!error?.length}
            image={Images.noTask}
            type={LoaderTypes.TaskScreen}
          />
        ) : (
          <>
            <FlatList
              data={tasks}
              keyExtractor={(item) => String(item._id)}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  onRefresh={() => fetchTasks(1, true)}
                  refreshing={loading}
                  colors={[themeColor.dark]}
                />
              }
              onEndReached={tab === "History" ? loadMoreTasks : undefined}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={8}
              // Improve scroll performance and reduce gesture conflicts
              scrollEventThrottle={16}
              bounces={true}
              bouncesZoom={false}
              alwaysBounceVertical={false}
              directionalLockEnabled={true}
            />
          </>
        )}
      </View>

      {tab === "Active" && (
        <FloatingAdd onPress={() => navigation.navigate(ROUTES.CREATE_TASK)} />
      )}
    </ScreenWrapper>
  );
}
