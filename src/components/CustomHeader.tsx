import { View, Text, TouchableOpacity } from "react-native";
import { Column, Row } from "../tools";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { commonStyles } from "../styles/commonstyles";
import { theme } from "../infrastructure/theme";
import TimeDisplay from "./time";
import Avatar from "./avatar";
import { useHelper } from "../utils/helper";
import { ROUTES } from "../enums/routes";
interface HeaderProps {
  title?: string;
  subTitle?: string;
  showBackbutton?: boolean;
  showImage?: boolean;
  onBackButtonPress?: () => void;
}
const CustomHeader = ({
  title,
  subTitle,
  showBackbutton,
  showImage,
  onBackButtonPress,
}: HeaderProps) => {
  const navigation: any = useNavigation();
  const { loggedInUser } = useHelper();
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
      <TimeDisplay />
    </Row>
  );
};

export default CustomHeader;
