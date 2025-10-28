import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

const ScreenLoader = () => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator
        size="large"
        color={themeColor?.dark ?? theme.colors.primary}
      />
    </View>
  );
};

export default ScreenLoader;
