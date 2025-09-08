import { Text, Image, ImageSourcePropType, View } from "react-native";
import { Column, isAndroid, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import CustomButton from "./customButton";

const EmptyState = ({
  image = require("../../assets/images/noData.png"),
  text,
  button,
  loading,
}: {
  image?: ImageSourcePropType;
  text: string;
  button?: () => void;
  loading?: boolean;
}) => {
  return (
    <Column
      style={commonStyles.fullFlex}
      gap={isAndroid ? 14 : 16}
      justifyContent="center"
      alignItems="center"
    >
      <Image
        style={{ height: 250, width: 300 }}
        resizeMode="contain"
        source={image}
      />
      <Text style={commonStyles.subTitleText}>{text}</Text>
      {button && (
        <Row style={commonStyles.fullWidth}>
          <CustomButton
            loading={loading}
            title="Refresh"
            onPress={button}
            halfWidth
            rounded
          />
        </Row>
      )}
    </Column>
  );
};

export default EmptyState;
