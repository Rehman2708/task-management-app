import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useCompletedTasksViewModel } from "./historyViewModel";
import { styles } from "./styles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useFocusEffect } from "@react-navigation/native";
import { useHelper } from "../../utils/helper";

export default function HistoryScreen({ navigation }: any) {
  const { tasks, loading, error, fetchCompletedTasks } =
    useCompletedTasksViewModel();
  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedTasks();
    }, [])
  );

  const { formatDate } = useHelper();

  const renderTaskCard = ({ item }: { item: any }) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, {
            taskId: item._id,
            readOnly: true,
          })
        }
        style={[commonStyles.cardContainer]}
      >
        <Column gap={isAndroid ? 5 : 6}>
          <Row justifyContent="space-between" alignItems="center">
            <Text
              style={[commonStyles.subTitleText, commonStyles.fullFlex]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Spacer size={20} position="right" />
            <Text style={commonStyles.tinyText}>
              {formatDate(item.updatedAt)}
            </Text>
          </Row>
          {item.description && (
            <Text numberOfLines={2} style={commonStyles.smallText}>
              {item.description}
            </Text>
          )}
          <Row justifyContent="space-between">
            <Text style={commonStyles.tinyText}>
              Created By: {item.createdBy}
            </Text>
            <Text style={commonStyles.tinyText}>
              Assigned To: {item.assignedTo}
            </Text>
          </Row>
        </Column>
      </Pressable>
    );
  };

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchCompletedTasks}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );

  return (
    <ScreenWrapper title="History">
      <View style={[commonStyles.screenWrapper]}>
        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTaskCard}
            onRefresh={fetchCompletedTasks}
            refreshing={loading}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            text="Nothing to show"
            button={fetchCompletedTasks}
            loading={loading}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
