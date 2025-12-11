import { Text, Image, ImageSourcePropType, View } from "react-native";
import { Column, isAndroid, Row } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import CustomButton from "./customButton";
import { errorDark, Images, noDataDark } from "../../assets/images/images";
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
  isDark,
}: {
  image?: ImageSourcePropType;
  text: string;
  subtext?: string;
  button?: () => void;
  loading?: boolean;
  error?: boolean;
  type?: LoaderTypes;
  isDark?: boolean;
}) => {
  image = isDark ? noDataDark : Images.noData;
  const errorImage = isDark ? errorDark : Images.error;
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
        <Text
          style={[
            commonStyles.subTitleText,
            isDark && { color: theme.colors.white },
          ]}
        >
          {error ? "Something went wrong!" : text ?? "Something went wrong!"}
        </Text>
        {subtext && (
          <Text
            style={[
              commonStyles.smallText,
              isDark && { color: theme.colors.white },
            ]}
          >
            {subtext}
          </Text>
        )}
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
