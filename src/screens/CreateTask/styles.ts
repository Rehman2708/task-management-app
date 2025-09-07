import { StyleSheet } from "react-native";
import { theme } from "../../infrastructure/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
  },

  subtaskContainer: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
  },

  removeButton: {
    marginTop: theme.spacing.xs,
    alignSelf: "flex-end",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.sm,
  },
  assignButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginVertical: 12,
    borderWidth: 1,
  },
  assignButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.transparent,
  },
  assignButtonInactive: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.primary,
  },
  assignTextActive: {
    color: theme.colors.white,
  },
  assignTextInactive: {
    color: theme.colors.primary,
  },
});
