import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../infrastructure/theme";

interface ProgressBarProps {
  endTime?: string;
}

const TimeProgressBar: React.FC<ProgressBarProps> = ({ endTime }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const colorValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const theme = useTheme();

  useEffect(() => {
    if (!endTime) return;

    const end = new Date(endTime).getTime();
    const now = Date.now();

    const twoDays = 2 * 12 * 60 * 60 * 1000; // 12 hours * 2
    const start = end - twoDays;

    if (now < start) {
      animatedValue.setValue(0);
      colorValue.setValue(0);
      return;
    }

    const totalDuration = twoDays;

    const progress = (now - start) / totalDuration;
    const clamped = Math.min(Math.max(progress, 0), 1);

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 1500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    let stage = 0;
    if (clamped < 0.33) stage = 0;
    else if (clamped < 0.66) stage = 0.5;
    else stage = 1;

    Animated.timing(colorValue, {
      toValue: stage,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    // 🛑 Stop ANY previously running pulse animations
    pulseValue.stopAnimation();
    pulseValue.setValue(1);

    // 🔥 Restart correct pulse animation
    if (stage === 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.15,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else if (stage === 0.5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.07,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [endTime]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const barColor = colorValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      theme.colors.success, // green
      theme.colors.warning, // orange
      theme.colors.error, // red
    ],
  });

  return (
    <View
      style={{
        height: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 10,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          width: widthInterpolated,
          backgroundColor: barColor,
          borderRadius: 10,
          transform: [{ scaleY: pulseValue }],
        }}
      />
    </View>
  );
};

export default TimeProgressBar;
