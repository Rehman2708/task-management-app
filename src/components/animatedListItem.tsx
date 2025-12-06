import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const directions = ["left", "right", "top", "bottom"];

export default function AnimatedListItem({
  index,
  children,
  animate = true,
}: any) {
  const translate = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current; // DEFAULT 1 for normal animation

  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  const offsets: any = {
    left: { x: -width, y: 0 },
    right: { x: width, y: 0 },
    top: { x: 0, y: -height },
    bottom: { x: 0, y: height },
  };

  useEffect(() => {
    if (!animate) {
      // Only bounce + fade (no slide)
      translate.setValue({ x: 0, y: 0 });
      scale.setValue(0.8); // only shrink for bounce mode

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 14,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    // For animate = true → NO SCALE ANIMATION, keep size normal
    scale.setValue(1);

    translate.setValue(offsets[randomDirection]);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translate, {
        toValue: { x: 0, y: 0 },
        speed: 12,
        bounciness: 6,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animate]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [
          { translateX: translate.x },
          { translateY: translate.y },
          { scale }, // stays 1 for animate=true
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
