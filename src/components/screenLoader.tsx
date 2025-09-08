import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { theme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

const ScreenLoader = () => {
  const { themeColor } = useHelper();
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
