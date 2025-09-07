import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../infrastructure/theme";

export default function FloatingAdd({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
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
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  plus: { color: "#fff", fontSize: 32, lineHeight: 36 },
});
