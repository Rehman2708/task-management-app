import { View, Text } from "react-native";
import { useTheme } from "../infrastructure/theme";
import CommentNotificationToast from "../components/CommentNotificationToast";
import { createBaseToastStyles, getToastBorderColor } from "./toastStyles";

// Custom toast component
const CustomToast = ({
  type,
  text1,
  text2,
}: {
  type: "success" | "error" | "info" | "warning";
  text1: string;
  text2?: string;
}) => {
  const theme = useTheme();
  const styles = createBaseToastStyles(theme);
  const borderColor = getToastBorderColor(type, theme);

  return (
    <View style={[styles.baseToastContainer, { borderColor }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props: any) => (
    <CustomToast type="success" text1={props.text1} text2={props.text2} />
  ),

  error: (props: any) => (
    <CustomToast type="error" text1={props.text1} text2={props.text2} />
  ),

  info: (props: any) => (
    <CustomToast type="info" text1={props.text1} text2={props.text2} />
  ),

  warning: (props: any) => (
    <CustomToast type="warning" text1={props.text1} text2={props.text2} />
  ),

  commentNotification: (props: any) => (
    <CommentNotificationToast
      title={props.text1}
      message={props.text2}
      notificationData={props.props?.notificationData}
      onPress={props.props?.onPress}
    />
  ),
};
