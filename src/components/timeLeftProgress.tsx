import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { theme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";

interface ProgressBarProps {
  startTime: string; // e.g. "2025-09-19T16:03:49.050Z"
  endTime: string; // e.g. "2025-09-21T15:30:00.000Z"
}

const ProgressBar: React.FC<ProgressBarProps> = ({ startTime, endTime }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { themeColor } = useHelper();
  useEffect(() => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();

    if (end <= start) return;

    const updatePercentage = () => {
      const now = new Date().getTime();
      let progress = 0;

      if (now <= start) progress = 0;
      else if (now >= end) progress = 1;
      else progress = (now - start) / (end - start);

      setPercentage(Math.min(Math.round(progress * 100), 100));
    };

    // initial progress
    updatePercentage();

    if (now <= start) {
      // hasn't started yet → wait until start
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

    // update percentage every second
    const interval = setInterval(updatePercentage, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

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

const styles = StyleSheet.create({
  progressBackground: {
    height: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    flex: 1,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
});

export default ProgressBar;
