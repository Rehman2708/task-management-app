import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

interface ProgressBarProps {
  startTime?: string; // e.g. "2025-09-19T16:03:49.050Z"
  endTime?: string; // e.g. "2025-09-21T15:30:00.000Z"
  duration?: number; // in seconds
  currentTime?: number; // in seconds
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  startTime,
  endTime,
  duration,
  currentTime,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = progressBarStyle(theme, duration ? true : false);

  useEffect(() => {
    // 🟢 CASE 1: When duration & currentTime are provided (e.g., video progress)
    if (typeof duration === "number" && typeof currentTime === "number") {
      const progress = duration > 0 ? currentTime / duration : 0;
      setPercentage(Math.min(Math.round(progress * 100), 100));
      animatedValue.setValue(progress);
      return;
    }

    // 🟢 CASE 2: Time-based progress (startTime → endTime)
    if (!startTime || !endTime) return;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();

    if (end <= start) return;

    const totalDuration = end - start;
    const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in ms

    // 🔴 If total duration is more than 12 hours, keep progress empty
    if (totalDuration > twelveHours) {
      animatedValue.setValue(0);
      setPercentage(0);
      return;
    }

    // ✅ Otherwise calculate progress normally within that 12-hour window
    const updatePercentage = () => {
      const current = new Date().getTime();
      let progress = 0;
      if (current <= start) progress = 0;
      else if (current >= end) progress = 1;
      else progress = (current - start) / (end - start);

      setPercentage(Math.min(Math.round(progress * 100), 100));
      animatedValue.setValue(progress);
    };

    // Initial call
    updatePercentage();

    // Start animation when within time range
    if (now <= start) {
      const delay = start - now;
      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: end - start,
          useNativeDriver: false,
        }).start();
      }, delay);
    } else if (now >= end) {
      animatedValue.setValue(1);
    } else {
      const progress = (now - start) / (end - start);
      animatedValue.setValue(progress);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: end - now,
        useNativeDriver: false,
      }).start();
    }

    const interval = setInterval(updatePercentage, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, duration, currentTime]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressBackground}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: widthInterpolated, backgroundColor: themeColor.dark },
        ]}
      />
    </View>
  );
};

const progressBarStyle = (theme: any, duration?: boolean) =>
  StyleSheet.create({
    progressBackground: {
      height: 8,
      borderRadius: duration ? 0 : 10,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      flex: 1,
    },
    progressFill: {
      height: "100%",
      borderRadius: duration ? 0 : 10,
    },
  });

export default ProgressBar;
