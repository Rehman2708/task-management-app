import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useHelper } from "../utils/helper";
import { useTheme } from "../infrastructure/theme";

export default function FloatingAdd({ onPress }: { onPress: () => void }) {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = AddButtonStyles(theme);
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: themeColor?.dark ?? theme.colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const AddButtonStyles = (theme: any) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      right: 20,
      bottom: 110,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
    },
    plus: { color: theme.colors.white, fontSize: 32, lineHeight: 36 },
  });
