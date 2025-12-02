import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

interface ProgressBarProps {
  duration?: number; // video duration in seconds
  currentTime?: number; // current playback time in seconds
}

const VideoTimeProgressBar: React.FC<ProgressBarProps> = ({
  duration = 0,
  currentTime = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = getStyles(theme);

  // Keep track of previous progress
  const previousProgress = useRef(0);

  useEffect(() => {
    if (duration <= 0) return;

    let progress = Math.min(currentTime / duration, 1);

    // If video looped (progress < previous), reset instantly
    if (progress < previousProgress.current) {
      animatedValue.setValue(0);
    }

    // Animate smoothly from current value to new progress
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300, // smooth duration
      easing: Easing.linear, // linear motion
      useNativeDriver: false,
    }).start();

    previousProgress.current = progress;
  }, [currentTime, duration]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const barColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColor.light, themeColor.dark],
  });

  return (
    <View style={styles.progressBackground}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: widthInterpolated, backgroundColor: barColor },
        ]}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    progressBackground: {
      height: 3,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
    },
  });

export default VideoTimeProgressBar;
