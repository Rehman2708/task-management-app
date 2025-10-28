import { Text, Image, ImageSourcePropType, View } from "react-native";
import { Column, isAndroid, Row } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import CustomButton from "./customButton";
import { Images } from "../../assets/images/images";
import { useTheme } from "../infrastructure/theme";

const EmptyState = ({
  image = Images.noData,
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
  const errorImage = Images.error;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  return (
    <Column
      style={commonStyles.fullFlex}
      gap={isAndroid ? 14 : 16}
      justifyContent="center"
      alignItems="center"
    >
      <Image
        style={{ height: 150, width: 250 }}
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
