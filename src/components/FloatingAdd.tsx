import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

export default function FloatingAdd({ onPress }: { onPress: () => void }) {
  const { themeColor } = useHelper();
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

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  plus: { color: "#fff", fontSize: 32, lineHeight: 36 },
});
