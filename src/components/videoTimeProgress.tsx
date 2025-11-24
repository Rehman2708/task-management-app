import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

interface ProgressBarProps {
  duration?: number; // optional manual duration
  currentTime?: number; // optional manual current time
}

const VideoTimeProgressBar: React.FC<ProgressBarProps> = ({
  duration,
  currentTime,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const colorValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = getStyles(theme, !!duration);

  useEffect(() => {
    if (typeof duration === "number" && typeof currentTime === "number") {
      const progress = duration > 0 ? currentTime / duration : 0;
      const clamped = Math.min(Math.max(progress, 0), 1);
      setPercentage(Math.round(clamped * 100));

      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: clamped,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(colorValue, {
          toValue: clamped,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();

      return;
    }

    const calculateProgress = () => {
      let progress = 0;

      const clamped = Math.min(Math.max(progress, 0), 1);
      setPercentage(Math.round(clamped * 100));

      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: clamped,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(colorValue, {
          toValue: clamped,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    };

    // Initial call
    calculateProgress();

    // Update every 1 second
    const interval = setInterval(calculateProgress, 1000);

    return () => clearInterval(interval);
  }, [duration, currentTime]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const barColor = colorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      duration ? themeColor.dark : themeColor.light,
      themeColor.dark,
    ],
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

const getStyles = (theme: any, isFlat: boolean) =>
  StyleSheet.create({
    progressBackground: {
      height: 8,
      borderRadius: isFlat ? 0 : 10,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      flex: 1,
    },
    progressFill: {
      height: "100%",
      borderRadius: isFlat ? 0 : 10,
    },
  });

export default VideoTimeProgressBar;
