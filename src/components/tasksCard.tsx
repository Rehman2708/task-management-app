import {
  Text,
  Image,
  View,
  ViewStyle,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Column, isAndroid, Row, Spacer } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import Swiper from "./swiper";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types/task";
import { ROUTES } from "../enums/routes";
import { useNavigation } from "@react-navigation/native";

const TasksCard = ({
  item,
  containerStyle,
  handleDelete,
}: {
  item: Task;
  containerStyle?: ViewStyle;
  handleDelete?: () => void;
}) => {
  const navigation: any = useNavigation();
  const { formatDate, getPriorityColor } = useHelper();
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
  return (
    <Swiper rightAction={rightAction}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(ROUTES.TASK_DETAIL, { taskId: item._id })
        }
        style={[
          commonStyles.cardContainer,
          {
            borderLeftWidth: 3,
            borderStartColor: getPriorityColor(item?.priority!),
            ...containerStyle,
          },
        ]}
      >
        <Row alignItems="center">
          {item?.image && (
            <Image
              source={{ uri: item.image }}
              style={{
                height: 60,
                width: 60,
                borderRadius: 100,
                backgroundColor: "#c0c0c0",
              }}
            />
          )}
          <Spacer size={8} position="right" />
          <Column gap={isAndroid ? 3 : 4} style={commonStyles.fullFlex}>
            <Row justifyContent="space-between" alignItems="center">
              <Text
                style={[commonStyles.basicText, commonStyles.fullFlex]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Spacer size={20} position="right" />
              <Text style={commonStyles.tTinyText}>
                {formatDate(item.createdAt)}
              </Text>
            </Row>
            <Text numberOfLines={2} style={commonStyles.tinyText}>
              {item.description || "No Description"}
            </Text>
            <Row justifyContent="space-between" alignItems="center">
              <Row alignItems="center">
                <Text style={commonStyles.tTinyText}>Creator: </Text>
                <Avatar
                  name={
                    item?.createdByDetails
                      ? item?.createdByDetails?.name?.split(" ")[0]
                      : item?.createdBy
                  }
                  image={item?.createdByDetails?.image}
                  withName
                />
              </Row>

              <Text style={commonStyles.tTinyText}>
                Assigned To: {item.assignedTo}
              </Text>
            </Row>
          </Column>
        </Row>
      </TouchableOpacity>
    </Swiper>
  );
};

export default TasksCard;
