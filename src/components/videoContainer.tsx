import React from "react";
import { View, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { theme } from "../infrastructure/theme";

const AuthBgContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>{children}</SafeAreaView>
    </View>
  );
};

export default AuthBgContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
