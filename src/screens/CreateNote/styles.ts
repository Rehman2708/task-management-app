import { StyleSheet } from "react-native";
import { theme } from "../../infrastructure/theme";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    backgroundColor: "#fff",
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  deleteText: {
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
  },
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
  },
});
