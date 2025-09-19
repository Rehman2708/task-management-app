import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useCompletedTasksViewModel } from "./historyViewModel";
import { styles } from "./styles";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import EmptyState from "../../components/emptyState";
import { useFocusEffect } from "@react-navigation/native";
import { useHelper } from "../../utils/helper";
import { theme } from "../../infrastructure/theme";
import CustomInput from "../../components/customInput";

export default function HistoryScreen({ navigation }: any) {
  const {
    tasks,
    loading,
    error,
    fetchCompletedTasks,
    deleteTask,
    searchTasks,
  } = useCompletedTasksViewModel();
  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedTasks();
    }, [])
  );

  const { formatDate, loggedInUser } = useHelper();

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
          {loggedInUser?.userId === "RehmanK" && (
            <Row justifyContent="flex-end">
              <TouchableOpacity
                onPress={() => deleteTask(item._id)}
                style={{ padding: 8, paddingBottom: 0 }}
              >
                <Text
                  style={[
                    commonStyles.basicText,
                    { color: theme.colors.error },
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </Row>
          )}
        </Column>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper title="History">
      <View style={[commonStyles.screenWrapper]}>
        {tasks.length > 0 ? (
          <>
            <CustomInput
              placeholder="Search here..."
              onChangeText={searchTasks}
            />
            <FlatList
              data={tasks}
              keyExtractor={(item) => item._id}
              renderItem={renderTaskCard}
              onRefresh={fetchCompletedTasks}
              refreshing={loading}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <EmptyState
            text="Nothing to show"
            button={fetchCompletedTasks}
            loading={loading}
            error={!!error?.length}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
