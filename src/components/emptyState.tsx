import { Text, Image, ImageSourcePropType } from "react-native";
import { Column } from "../tools";
import { commonStyles } from "../styles/commonstyles";

const EmptyState = ({
  image = require("../../assets/images/noData.png"),
  text,
}: {
  image?: ImageSourcePropType;
  text: string;
}) => {
  return (
    <Column
      style={commonStyles.fullFlex}
      gap={16}
      justifyContent="center"
      alignItems="center"
    >
      <Image
        style={{ height: 300, width: 300 }}
        resizeMode="contain"
        source={image}
      />
      <Text style={commonStyles.subTitleText}>{text}</Text>
    </Column>
  );
};

export default EmptyState;
