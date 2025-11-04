import { StyleSheet } from "react-native";
import { isAndroid, isDarkMode } from "../tools";

export const useCommonStyles = (theme: any) =>
  StyleSheet.create({
    fullFlex: { flex: 1 },
    fullWidth: { width: "100%" },
    fullHeight: { height: "100%" },
    halfWidth: {
      width: "48%",
    },
    titleText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text,
      fontFamily: theme.fonts.semibold,
    },
    subTitleText: {
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text,
      fontFamily: theme.fonts.semibold,
    },
    basicText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.medium,
    },
    smallText: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text,
      fontFamily: theme.fonts.regular,
    },
    tinyText: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text,
      fontFamily: theme.fonts.light,
    },
    tTinyText: {
      fontSize: theme.fontSizes.xxs,
      color: theme.colors.textLight,
      fontFamily: theme.fonts.light,
    },
    whiteText: {
      color: theme.colors.white,
    },
    errorText: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.error,
      fontFamily: theme.fonts.regular,
      marginBottom: 8,
    },
    cardContainer: {
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      // borderRightColor: theme.colors.border,
      // borderBottomColor: theme.colors.border,
      overflow: "hidden",
      marginVertical: 5,
    },
    secondaryContainer: {
      backgroundColor: `${theme.colors.secondary}10`,
      padding: 12,
      borderRadius: 16,
      marginVertical: 8,
    },
    screenWrapper: {
      flex: 1,
      paddingHorizontal: isAndroid ? 6 : 16,
    },
    blurView: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
