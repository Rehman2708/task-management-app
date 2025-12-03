import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const directions = ["left", "right", "top", "bottom"];

export default function AnimatedListItem({ index, children }: any) {
  const translate = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  // Random starting offsets
  const offsets: any = {
    left: { x: -width, y: 0 },
    right: { x: width, y: 0 },
    top: { x: 0, y: -height },
    bottom: { x: 0, y: height },
  };

  useEffect(() => {
    translate.setValue(offsets[randomDirection]);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 80, // stagger
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
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ translateX: translate.x }, { translateY: translate.y }],
      }}
    >
      {children}
    </Animated.View>
  );
}
