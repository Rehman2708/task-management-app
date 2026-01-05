import {
  Text,
  Image,
  View,
  ViewStyle,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Column, isAndroid, Row, Spacer } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import Swiper from "./swiper";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types/task";
import { ROUTES } from "../enums/routes";
import { useNavigation } from "@react-navigation/native";
import CardWrapper from "./cardWrapper";
import { useTheme } from "../infrastructure/theme";
import { AssignedIcon } from "../screens/CreateTask/components/subtaskItem";
import { SubtaskStatus } from "../enums/tasks";

const TasksCard = ({
  item,
  containerStyle,
  handleDelete,
  isCompleted,
}: {
  item: Task;
  containerStyle?: ViewStyle;
  handleDelete?: () => void;
  isCompleted?: boolean;
}) => {
  const navigation: any = useNavigation();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const { formatDate, getPriorityColor, themeColor } = useHelper();
  const rightAction = () => (
    <Pressable onPress={handleDelete} style={{ width: 80 }}>
      <Row
        justifyContent="center"
        alignItems="center"
        style={commonStyles.fullFlex}
      >
        <Ionicons name="trash" size={30} color={"red"} />
      </Row>
    </Pressable>
  );
  const leftAction = () => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate(ROUTES.CREATE_TASK, {
            task: item,
            repeat: isCompleted,
          })
        }
        style={{ width: 80 }}
      >
        <Row
          justifyContent="center"
          alignItems="center"
          style={commonStyles.fullFlex}
        >
          <Ionicons
            name={isCompleted ? "reload-outline" : "create-outline"}
            size={30}
            color={themeColor.dark}
          />
        </Row>
      </Pressable>
    );
  };

  return (
    <Swiper rightAction={rightAction} leftAction={leftAction}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, { taskId: item._id })
        }
      >
        <CardWrapper
          style={[
            commonStyles.cardContainer,
            {
              padding: 0,
              borderLeftWidth: 3,
              borderStartColor: getPriorityColor(item?.priority!),
              backgroundColor: theme.colors.background,
              ...containerStyle,
            },
          ]}
          // image={item?.image}
        >
          <Row alignItems="center">
            {item?.image && (
              <Image
                source={{ uri: item.image }}
                style={{
                  height: "100%",
                  width: 120,
                  backgroundColor: theme.colors.loaderBg,
                }}
              />
            )}
            <Column
              gap={6}
              justifyContent="space-evenly"
              style={[
                commonStyles.fullFlex,
                { paddingHorizontal: 12, paddingVertical: 6 },
              ]}
            >
              <Row justifyContent="space-between" alignItems="center">
                <Text
                  style={[commonStyles.basicText, commonStyles.fullFlex]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Spacer size={20} position="right" />
                <Row alignItems="center" gap={4}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={theme.colors.textLight}
                  />
                  <Text style={commonStyles.tTinyText}>
                    {formatDate(item.createdAt)}
                  </Text>
                </Row>
              </Row>
              <Text numberOfLines={2} style={commonStyles.tinyText}>
                {item.description || "📝 No Description"}
              </Text>
              <Row justifyContent="space-between" alignItems="center">
                <Row alignItems="center">
                  <Text style={commonStyles.tTinyText}>Creator: </Text>
                  <Avatar
                    name={
                      item?.createdByDetails
                        ? item?.createdByDetails?.name
                        : item?.createdBy
                    }
                    image={item?.createdByDetails?.image}
                    withName
                  />
                </Row>
                <Row alignItems="center" gap={6}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={14}
                    color={theme.colors.textLight}
                  />
                  <Text style={commonStyles.tTinyText}>
                    {item.totalComments ?? 0}
                  </Text>
                </Row>
              </Row>
              <Row justifyContent="space-between" alignItems="center">
                <Row alignItems="center" gap={4}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={12}
                    color={theme.colors.success}
                  />
                  <Text numberOfLines={2} style={commonStyles.tinyText}>
                    {
                      item.subtasks?.filter(
                        (item) => item.status === SubtaskStatus.Completed
                      ).length
                    }
                    /{item.subtasks?.length} completed
                  </Text>
                </Row>
                {/* Show task-level assignment if it exists (legacy tasks) */}
                {item.assignedTo && (
                  <Row alignItems="center" gap={4}>
                    <AssignedIcon
                      type={item.assignedTo}
                      size={12}
                      color={theme.colors.textLight}
                    />
                    <Text style={[commonStyles.tTinyText, { fontSize: 10 }]}>
                      Task: {item.assignedTo}
                    </Text>
                  </Row>
                )}
              </Row>
            </Column>
          </Row>
        </CardWrapper>
      </TouchableOpacity>
    </Swiper>
  );
};

export default TasksCard;
