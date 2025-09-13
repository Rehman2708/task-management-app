import { StyleSheet } from "react-native";
import { theme } from "../infrastructure/theme";
import { isAndroid, isDarkMode } from "../tools";

export const commonStyles = StyleSheet.create({
  fullFlex: { flex: 1 },
  fullWidth: { width: "100%" },
  fullHeight: { height: "100%" },
  halfWidth: {
    width: "46%",
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
    fontFamily: theme.fonts.regular,
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
    padding: isAndroid ? 10 : 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? "#2C2C2C99" : "#EAEAEA",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderRightColor: isDarkMode ? "#ffffff10" : "#00000014",
    borderBottomColor: isDarkMode ? "#ffffff10" : "#00000014",
    overflow: "hidden",
    marginVertical: 6,
  },
  secondaryContainer: {
    backgroundColor: `${theme.colors.secondary}10`,
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  screenWrapper: {
    flex: 1,
    paddingHorizontal: isAndroid ? 8 : 16,
  },
});
