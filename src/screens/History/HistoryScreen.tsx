import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { theme } from "../../infrastructure/theme";
import { useCompletedTasksViewModel } from "./historyViewModel";
import { styles } from "./styles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, Row } from "../../tools";
import EmptyState from "../../components/emptyState";

export default function HistoryScreen({ navigation }: any) {
  const { tasks, loading, error, fetchCompletedTasks } =
    useCompletedTasksViewModel();

  const renderTaskCard = ({ item }: { item: any }) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, {
            taskId: item._id,
            readOnly: true,
          })
        }
        style={[
          commonStyles.cardContainer,
          {
            backgroundColor:
              item.status === "Completed"
                ? `${theme.colors.success}30`
                : `${theme.colors.error}30`,
            borderColor:
              item.status === "Completed"
                ? `${theme.colors.success}30`
                : `${theme.colors.error}30`,
          },
        ]}
      >
        <Column gap={6}>
          <Text style={commonStyles.subTitleText} numberOfLines={1}>
            {item.title}
          </Text>
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
