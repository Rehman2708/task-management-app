import React from "react";
import { View, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { useTheme } from "../infrastructure/theme";

const AuthBgContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const styles = AuthBgContainerStyles(theme);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>{children}</SafeAreaView>
    </View>
  );
};

export default AuthBgContainer;

const AuthBgContainerStyles = (theme: any) =>
  StyleSheet.create({
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
