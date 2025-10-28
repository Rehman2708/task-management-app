import { StyleSheet } from "react-native";

export const TaskDetailStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: -8,
      marginRight: -8,
      padding: 12,
      marginVertical: 8,
    },
  });
