import { Text, TouchableOpacity, View } from "react-native";
import { Column, dimensions, Row, Spacer } from "../tools";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCommonStyles } from "../styles/commonstyles";
import Avatar from "./avatar";
import { useHelper } from "../utils/helper";
import { ROUTES } from "../enums/routes";
import { useTheme } from "../infrastructure/theme";
import TextTicker from "react-native-text-ticker";
interface HeaderProps {
  title?: string;
  subTitle?: string;
  showBackbutton?: boolean;
  rightIcon?: React.ReactNode;
  hideNotificationButton?: boolean;
  whiteBg?: boolean;
  showImage?: boolean;
  onBackButtonPress?: () => void;
  onSearchPress?: () => void;
}
const CustomHeader = ({
  title,
  subTitle,
  showBackbutton,
  rightIcon,
  showImage,
  whiteBg,
  onBackButtonPress,
  onSearchPress,
  hideNotificationButton,
}: HeaderProps) => {
  const navigation: any = useNavigation();
  const { loggedInUser, triggerVibration } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const tickerTextParts = [];

  if (loggedInUser?.about) {
    tickerTextParts.push(loggedInUser.about);
  }
  if (loggedInUser?.partner?.about) {
    tickerTextParts.push(`Partner: ${loggedInUser.partner.about}`);
  }

  const tickerText = tickerTextParts.join("   |    ");
  return (
    <>
      <Row
        justifyContent="space-between"
        alignItems="center"
        style={{ paddingHorizontal: 16, height: 50 }}
      >
        <Row alignItems="center" gap={10}>
          {showBackbutton && (
            <TouchableOpacity
              onPress={() => {
                triggerVibration("medium");
                if (onBackButtonPress) {
                  onBackButtonPress();
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={30}
                color={whiteBg ? theme.colors.text : theme.colors.white}
              />
            </TouchableOpacity>
          )}
          {showImage && loggedInUser?.image && (
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.PROFILE)}
            >
              <Avatar
                name={loggedInUser?.name}
                size={36}
                image={loggedInUser?.image}
              />
            </TouchableOpacity>
          )}
          <Column>
            {title && (
              <Text
                style={[
                  commonStyles.titleText,
                  !whiteBg && commonStyles.whiteText,
                ]}
              >
                {title}
              </Text>
            )}
            {subTitle && (
              <Text
                style={[
                  commonStyles.smallText,
                  !whiteBg && commonStyles.whiteText,
                ]}
              >
                {subTitle}
              </Text>
            )}
            {showImage &&
              (loggedInUser?.about || loggedInUser?.partner?.about) && (
                <>
                  <View style={{ width: dimensions.width - 150 }}>
                    <TextTicker
                      duration={tickerText.length * 30}
                      loop
                      bounce
                      repeatSpacer={50}
                      marqueeDelay={1000}
                      style={[commonStyles.smallText, commonStyles.whiteText]}
                    >
                      {tickerText}
                    </TextTicker>
                  </View>
                </>
              )}
          </Column>
        </Row>
        <Row>
          {onSearchPress && (
            <TouchableOpacity onPress={onSearchPress}>
              <Ionicons
                name="search"
                size={30}
                color={whiteBg ? theme.colors.text : theme.colors.white}
              />
            </TouchableOpacity>
          )}
          {!hideNotificationButton && (
            <>
              <Spacer size={20} position="right" />
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.NOTIFICATION)}
              >
                <Ionicons
                  name="notifications-outline"
                  size={30}
                  color={whiteBg ? theme.colors.text : theme.colors.white}
                />
              </TouchableOpacity>
            </>
          )}
          {rightIcon && (
            <>
              <Spacer size={20} position="right" />
              {rightIcon}
            </>
          )}
        </Row>
      </Row>
    </>
  );
};

export default CustomHeader;
