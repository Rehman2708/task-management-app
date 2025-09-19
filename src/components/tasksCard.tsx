import { Text, Image, View, ViewStyle } from "react-native";
import { Column, isAndroid, Row, Spacer } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";

const TasksCard = ({
  item,
  containerStyle,
}: {
  item: any;
  containerStyle?: ViewStyle;
}) => {
  const { formatDate, getPriorityColor } = useHelper();
  return (
    <View
      style={[
        commonStyles.cardContainer,
        {
          borderLeftWidth: 3,
          borderStartColor: getPriorityColor(item.priority),
          ...containerStyle,
        },
      ]}
    >
      <Row alignItems="center">
        {item.image && (
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
            <Text style={commonStyles.tTinyText}>
              Created by: {item.createdBy}
            </Text>
            <Text style={commonStyles.tTinyText}>
              Assigned To: {item.assignedTo}
            </Text>
          </Row>
        </Column>
      </Row>
    </View>
  );
};

export default TasksCard;
