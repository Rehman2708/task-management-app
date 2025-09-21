import React, { ReactNode, useRef, useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface SwiperProps {
  children: ReactNode;
  rightAction?: () => ReactNode;
  leftAction?: () => ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const Swiper: React.FC<SwiperProps> = ({
  children,
  rightAction,
  leftAction,
  containerStyle,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleSwipeOpen = useCallback(() => {
    const timer = setTimeout(() => {
      swipeableRef.current?.close();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={rightAction}
      renderLeftActions={leftAction}
      onSwipeableOpen={handleSwipeOpen}
      containerStyle={containerStyle}
    >
      {children}
    </Swipeable>
  );
};

export default Swiper;
