import { StyleSheet } from "react-native";
import { theme } from "../../infrastructure/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCard: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  taskTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.lg,
    color: "#fff",
  },
  taskSubtitle: {
    color: "#fff",
  },
  taskDescription: {
    color: "#fff",
    marginTop: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
  },
  retryText: {
    color: theme.colors.primary,
    marginTop: 8,
  },
});
