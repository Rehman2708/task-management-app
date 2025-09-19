import { Text, Image, ImageSourcePropType, View } from "react-native";
import { Column, isAndroid, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import CustomButton from "./customButton";

const EmptyState = ({
  image = require("../../assets/images/noData.png"),
  text,
  button,
  loading,
  error,
}: {
  image?: ImageSourcePropType;
  text: string;
  button?: () => void;
  loading?: boolean;
  error?: boolean;
}) => {
  const errorImage = require("../../assets/images/error.png");
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
        source={error ? errorImage : image}
      />
      <Text style={commonStyles.subTitleText}>
        {error ? "Something went wrong!" : text}
      </Text>
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
