import React, { ReactNode, useRef, useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useHelper } from "../utils/helper";

interface SwiperProps {
  children: ReactNode;
  rightAction?: () => ReactNode;
  leftAction?: () => ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  closeInstant?: boolean;
  onEnded?: () => void;
}

const Swiper: React.FC<SwiperProps> = ({
  children,
  rightAction,
  leftAction,
  containerStyle,
  closeInstant,
  onEnded,
}) => {
  const swipeableRef = useRef<Swipeable>(null);
  const { triggerVibration } = useHelper();

  const handleSwipeOpen = useCallback(() => {
    if (!closeInstant) {
      const timer = setTimeout(() => {
        swipeableRef.current?.close();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      swipeableRef.current?.close();
    }
  }, [closeInstant]);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={rightAction}
      renderLeftActions={leftAction}
      onSwipeableOpen={handleSwipeOpen}
      containerStyle={containerStyle}
      onActivated={() => triggerVibration()}
      onSwipeableClose={onEnded}
      // Fix gesture conflicts with FlatList and tab navigation
      friction={2}
      overshootFriction={8}
      enableTrackpadTwoFingerGesture={false}
      // Reduce sensitivity to prevent accidental swipes during scrolling
      leftThreshold={40}
      rightThreshold={40}
      // Improve gesture recognition
      useNativeAnimations={true}
    >
      {children}
    </Swipeable>
  );
};

export default Swiper;
