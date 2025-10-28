import { Text, TouchableOpacity } from "react-native";
import { Column, Row } from "../tools";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCommonStyles } from "../styles/commonstyles";
import Avatar from "./avatar";
import { useHelper } from "../utils/helper";
import { ROUTES } from "../enums/routes";
import { useTheme } from "../infrastructure/theme";
interface HeaderProps {
  title?: string;
  subTitle?: string;
  showBackbutton?: boolean;
  hideNotificationButton?: boolean;
  showImage?: boolean;
  onBackButtonPress?: () => void;
  onSearchPress?: () => void;
}
const CustomHeader = ({
  title,
  subTitle,
  showBackbutton,
  showImage,
  onBackButtonPress,
  onSearchPress,
  hideNotificationButton,
}: HeaderProps) => {
  const navigation: any = useNavigation();
  const { loggedInUser } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      style={{ paddingHorizontal: 16 }}
    >
      <Row alignItems="center" gap={10}>
        {showBackbutton && (
          <TouchableOpacity
            onPress={
              onBackButtonPress ? onBackButtonPress : () => navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back-outline"
              size={30}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        )}
        {showImage && loggedInUser?.image && (
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE)}>
            <Avatar
              name={loggedInUser?.name}
              size={30}
              image={loggedInUser?.image}
            />
          </TouchableOpacity>
        )}
        <Column>
          {title && (
            <Text style={[commonStyles.titleText, commonStyles.whiteText]}>
              {title}
            </Text>
          )}
          {subTitle && (
            <Text style={[commonStyles.smallText, commonStyles.whiteText]}>
              {subTitle}
            </Text>
          )}
        </Column>
      </Row>
      <Row gap={20}>
        {onSearchPress && (
          <TouchableOpacity onPress={onSearchPress}>
            <Ionicons name="search" size={30} color={theme.colors.white} />
          </TouchableOpacity>
        )}
        {!hideNotificationButton && (
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.NOTIFICATION)}
          >
            <Ionicons
              name="notifications-outline"
              size={30}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        )}
      </Row>
    </Row>
  );
};

export default CustomHeader;
