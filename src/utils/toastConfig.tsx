import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { dimensions, isAndroid } from "../tools";

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
  const getBorderColor = () => {
    switch (type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };
  const styles = toastStyles(theme);
  return (
    <View
      style={[
        styles.toastContainer,
        {
          borderColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.text1]}>{text1}</Text>
        {text2 && <Text style={[styles.text2]}>{text2}</Text>}
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
};

const toastStyles = (theme: any) =>
  StyleSheet.create({
    toastContainer: {
      borderWidth: 1,
      borderLeftWidth: 6, // Made thicker to be more visible
      borderRadius: 8,
      marginHorizontal: 16,
      marginTop: 8,
      padding: isAndroid ? 10 : 16,
      elevation: 4,
      shadowColor: "#000",
      width: dimensions.width * 0.9,
      backgroundColor: theme.colors.background,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    contentContainer: {
      flex: 1,
    },
    text1: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.semibold,
      color: theme.colors.text,
    },
    text2: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textLight,
      lineHeight: 18,
    },
  });
