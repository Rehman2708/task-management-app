import { Text, Image, ImageSourcePropType, View } from "react-native";
import { Column, isAndroid, Row } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import CustomButton from "./customButton";
import { Images } from "../../assets/images/images";
import { useTheme } from "../infrastructure/theme";
import ScreenLoader, { LoaderTypes } from "./screenLoader";

const EmptyState = ({
  image = Images.noData,
  text,
  subtext,
  button,
  loading,
  error,
  type,
}: {
  image?: ImageSourcePropType;
  text: string;
  subtext?: string;
  button?: () => void;
  loading?: boolean;
  error?: boolean;
  type?: LoaderTypes;
}) => {
  const errorImage = Images.error;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  if (loading) {
    return <ScreenLoader type={type} />;
  }
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
      <Column alignItems="center">
        <Text style={commonStyles.subTitleText}>
          {text ?? "Something went wrong!"}
        </Text>
        {subtext && <Text style={commonStyles.smallText}>{subtext}</Text>}
      </Column>
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
