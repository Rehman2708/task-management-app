import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../infrastructure/theme";

interface ProgressBarProps {
  startTime?: string;
  endTime?: string;
}

const TimeProgressBar: React.FC<ProgressBarProps> = ({
  startTime,
  endTime,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const colorValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const theme = useTheme();

  useEffect(() => {
    if (!startTime || !endTime) return;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = Date.now();

    const fullWindow = 1 * 24 * 60 * 60 * 1000; // true 1 day in ms

    const duration = end - start;

    const effectiveDuration = duration > fullWindow ? fullWindow : duration;

    const effectiveStart = duration > fullWindow ? end - fullWindow : start;

    if (now < effectiveStart) {
      animatedValue.setValue(0);
      colorValue.setValue(0);
      return;
    }

    const progress = (now - effectiveStart) / effectiveDuration;
    const clamped = Math.min(Math.max(progress, 0), 1);

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 1500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // stage transitions: green → orange → red
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

    // Pulse animation based on urgency
    pulseValue.stopAnimation();
    pulseValue.setValue(1);

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
  }, [startTime, endTime]);

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
