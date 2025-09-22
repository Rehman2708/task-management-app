import { BlurView } from "expo-blur";
import React from "react";
import { View, ImageBackground, StyleProp, ViewStyle } from "react-native";
import { isAndroid, isDarkMode } from "../tools";
import { commonStyles } from "../styles/commonstyles";

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
  const MemoBlur = React.memo(() => (
    <BlurView
      intensity={isAndroid ? 700 : 40}
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
