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
  }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={rightAction}
      renderLeftActions={leftAction}
      onSwipeableOpen={handleSwipeOpen}
      containerStyle={containerStyle}
      onActivated={() => triggerVibration()}
      onSwipeableClose={onEnded}
    >
      {children}
    </Swipeable>
  );
};

export default Swiper;
