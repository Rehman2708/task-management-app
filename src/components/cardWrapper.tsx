import { BlurView } from "expo-blur";
import React from "react";
import { View, ImageBackground, StyleProp, ViewStyle } from "react-native";
import { isAndroid, isDarkMode } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";

interface CardWrapperProps {
  image?: string | null;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  image,
  children,
  style,
}) => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const MemoBlur = React.memo(() => (
    <BlurView
      intensity={isAndroid ? 100 : 40}
      tint={isDarkMode ? "dark" : "light"}
      style={commonStyles.blurView}
    />
  ));
  if (image) {
    return (
      <ImageBackground
        source={{ uri: image }}
        style={[{ position: "relative" }, style]}
      >
        {image && <MemoBlur />}
        {children}
      </ImageBackground>
    );
  }

  return <View style={[style]}>{children}</View>;
};

export default CardWrapper;
