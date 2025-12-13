import { StyleSheet } from "react-native";
import { dimensions, isAndroid } from "../tools";

/**
 * Shared toast styling utilities
 */
export const createBaseToastStyles = (theme: any) =>
  StyleSheet.create({
    baseToastContainer: {
      borderWidth: 1,
      borderLeftWidth: 6,
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
    title: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.semibold,
      color: theme.colors.text,
    },
    message: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textLight,
      lineHeight: 18,
    },
  });

/**
 * Get border color for toast type
 */
export const getToastBorderColor = (
  type: "success" | "error" | "info" | "warning" | "primary",
  theme: any
) => {
  switch (type) {
    case "success":
      return theme.colors.success;
    case "error":
      return theme.colors.error;
    case "warning":
      return theme.colors.warning;
    case "info":
    case "primary":
      return theme.colors.primary;
    default:
      return theme.colors.primary;
  }
};
