import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
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

export default function HomeScreen({ navigation }: any) {
  const { tasks, loading, error, fetchTasks, deleteTask } =
    useHomeScreenViewModel();
  const { loggedInUser, themeColor, formatDate } = useHelper();
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
        style={[
          commonStyles.cardContainer,
          {
            backgroundColor: `${themeColor?.light ?? theme.colors.secondary}20`,
            borderColor: `${themeColor?.light ?? theme.colors.secondary}20`,
          },
        ]}
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
              {formatDate(item.createdAt)}
            </Text>
          </Row>
          <Text numberOfLines={2} style={commonStyles.smallText}>
            {item.description || "No Description"}
          </Text>
          <Row justifyContent="space-between" alignItems="center">
            <Text style={commonStyles.tinyText}>
              Created by: {item.createdBy}
            </Text>
            <Text style={commonStyles.tinyText}>
              Assigned To: {item.assignedTo}
            </Text>
          </Row>
          <Row justifyContent="flex-end">
            <TouchableOpacity
              onPress={() => deleteTask(item._id)}
              style={{ padding: 8, paddingBottom: 0 }}
            >
              <Text
                style={[commonStyles.basicText, { color: theme.colors.error }]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </Row>
        </Column>
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
