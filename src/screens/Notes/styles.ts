import { StyleSheet } from "react-native";
import { theme } from "../../infrastructure/theme";

export const styles = StyleSheet.create({
  noteContainer: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  noteText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    padding: 8,
    paddingBottom: 0,
  },
  editText: {
    color: theme.colors.success,
    fontFamily: theme.fonts.medium,
  },

  deleteText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.medium,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
  },
});
