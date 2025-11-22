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

    // 2-Day window
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const start = end - twoDays;

    if (now < start) {
      animatedValue.setValue(0);
      colorValue.setValue(0);
      return;
    }

    const totalDuration = twoDays;
    const timeLeft = end - now;

    // Progress Animation
    const progress = (now - start) / totalDuration;
    const clamped = Math.min(Math.max(progress, 0), 1);

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Color Stage
    let stage = 0;
    if (timeLeft > 24 * 60 * 60 * 1000) {
      stage = 0; // Green
    } else if (timeLeft > 12 * 60 * 60 * 1000) {
      stage = 0.5; // Orange
    } else {
      stage = 1; // Red
    }

    // Smooth color transition
    Animated.timing(colorValue, {
      toValue: stage,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    // 🔥 Pulse Animation based on urgency
    if (stage === 1) {
      // Red zone → Fast pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else if (stage === 0.5) {
      // Orange zone → Gentle breathing
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
    } else {
      // Green zone → No pulse
      pulseValue.setValue(1);
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
