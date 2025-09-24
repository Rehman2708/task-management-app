import { StyleSheet } from "react-native";
import { theme } from "../../infrastructure/theme";

export const styles = StyleSheet.create({
  videoContainer: {
    height: 300,
    marginVertical: 10,
  },
  videoPlayer: {
    flex: 1,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
});
