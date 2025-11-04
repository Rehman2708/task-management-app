import React, { useEffect, useRef, useState, useMemo } from "react";
import { Animated, Dimensions, View, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../infrastructure/theme";
import { isAndroid } from "../tools";
import { useHelper } from "../utils/helper";
import { useCommonStyles } from "../styles/commonstyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LinearHeaderProps {
  image?: string | string[];
}

const { width } = Dimensions.get("window");

const LinearHeader: React.FC<LinearHeaderProps> = ({ image }) => {
  const { themeColor, loggedInUser } = useHelper();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const commonStyles = useCommonStyles(theme);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images array
  const images = useMemo(() => {
    if (image) {
      const imgArray = Array.isArray(image) ? image : [image];
      return imgArray.filter((i): i is string => !!i?.trim());
    } else {
      return [loggedInUser?.image, loggedInUser?.partner?.image].filter(
        Boolean
      );
    }
  }, [image, loggedInUser?.image, loggedInUser?.partner?.image]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length, fadeAnim]);

  const headerHeight = isAndroid ? 80 + insets.top : 130;
  const currentImageUri =
    images[currentIndex] ?? loggedInUser?.partner?.image ?? loggedInUser?.image;

  return (
    <View style={{ position: "relative" }}>
      <LinearGradient
        colors={[
          themeColor?.dark ?? theme.colors.primary,
          themeColor?.light ?? theme.colors.secondary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 2 }}
        locations={[0.2, 0.65]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          width: "100%",
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          overflow: "hidden",
        }}
      >
        {currentImageUri && (
          <Animated.Image
            source={{ uri: currentImageUri }}
            style={{
              ...commonStyles.fullFlex,
              position: "absolute",
              width,
              height: headerHeight,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              opacity: fadeAnim,
            }}
            resizeMode="cover"
          />
        )}
      </LinearGradient>

      {/* Black overlay */}
      <LinearGradient
        colors={["#00000080", "#00000080"]}
        style={{
          ...commonStyles.fullFlex,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: headerHeight,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />
    </View>
  );
};

export default LinearHeader;
