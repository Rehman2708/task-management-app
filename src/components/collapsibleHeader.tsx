import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Dimensions,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  ImageBackground,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ImageView from "react-native-image-viewing";

import { useTheme } from "../infrastructure/theme";
import { useAuthStore } from "../store/authStore";
import { useCommonStyles } from "../styles/commonstyles";
import CustomHeader from "./CustomHeader";
import { dimensions, isDarkMode, Spacer } from "../tools";
import { useHelper } from "../utils/helper";

const { width: screenWidth } = Dimensions.get("window");
export const HEADER_MAX_HEIGHT = 300;
export const HEADER_MIN_HEIGHT = 0;

interface CollapsibleHeaderTabsProps {
  headerHeight?: number;
  headerImage?: string | string[];
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

const CollapsibleHeaderTabs: React.FC<CollapsibleHeaderTabsProps> = ({
  headerHeight = HEADER_MAX_HEIGHT,
  headerImage,
  subTitle,
  title,
  children,
  onRefresh,
}) => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { triggerVibration, themeColor } = useHelper();

  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const HEADER_SCROLL_DISTANCE = useMemo(
    () => headerHeight - HEADER_MIN_HEIGHT,
    [headerHeight]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header scaling and parallax
  const headerImageStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [headerHeight, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(scrollY.value, [-200, 0], [2, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  // Sticky header visibility
  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE / 1.4],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  // Back button fade-out
  const animatedBackButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE / 1.4],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // -----------------------------
  // Multi-image fade animation
  // -----------------------------
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(() => {
    let arr: string[] = [];
    if (Array.isArray(headerImage)) {
      arr = headerImage.filter((i): i is string => !!i?.trim());
    } else if (typeof headerImage === "string" && headerImage.trim()) {
      arr = [headerImage];
    } else {
      arr = [user?.image, user?.partner?.image].filter(Boolean) as string[];
    }
    return arr;
  }, [
    Array.isArray(headerImage) ? headerImage.join(",") : headerImage,
    user?.image,
    user?.partner?.image,
  ]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const currentImageUri = images[currentIndex] || null;

  return (
    <>
      {/* Header Section */}
      <Animated.View style={[styles.headerContainer, headerImageStyle]}>
        {currentImageUri && (
          <ImageBackground
            source={{ uri: currentImageUri }}
            style={{
              ...StyleSheet.absoluteFillObject,
              // width: screenWidth,
              // height: headerHeight,
              // opacity: fadeAnim,
            }}
            resizeMode="cover"
          />
        )}

        {/* Black overlay */}
        <RNAnimated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#00000080",
          }}
        />
      </Animated.View>

      {/* Top Navigation Bar */}
      <Animated.View
        style={[
          styles.topBar,
          animatedBackButtonStyle,
          { top: insets.top + 10 },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            triggerVibration("medium");
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={30}
            color={theme.colors.white}
          />
        </TouchableOpacity>
        {currentImageUri && (
          <TouchableOpacity onPress={() => setShowImage(true)}>
            <Ionicons
              name="expand-outline"
              size={30}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          stickyHeaderStyle,
          { paddingTop: insets.top, height: 115 },
        ]}
      >
        <CustomHeader
          subTitle={subTitle}
          title={title}
          showBackbutton
          hideNotificationButton
          whiteBg={!isDarkMode}
        />
      </Animated.View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={commonStyles.fullFlex}
      >
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh && (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[themeColor.dark]}
              />
            )
          }
          contentContainerStyle={{
            paddingTop: headerHeight - insets.top,
          }}
        >
          <View
            style={[
              commonStyles.screenWrapper,
              styles.contentContainer,
              { minHeight: dimensions.height + insets.top + 50 },
            ]}
          >
            {/* {title && (
              <Text numberOfLines={3} style={commonStyles.titleText}>
                {title}
              </Text>
            )}
            {subTitle && (
              <>
                <Spacer size={6} />
                <Text numberOfLines={3} style={commonStyles.tinyText}>
                  {subTitle}
                </Text>
              </>
            )} */}
            <Spacer size={16} />
            {children}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Image Viewer */}
      <ImageView
        images={images.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={showImage}
        onRequestClose={() => setShowImage(false)}
        presentationStyle="overFullScreen"
        swipeToCloseEnabled
        backgroundColor={theme.colors.background}
      />
    </>
  );
};

export default CollapsibleHeaderTabs;

const createStyles = (theme: any) =>
  StyleSheet.create({
    headerContainer: {
      width: screenWidth,
      position: "absolute",
      top: 0,
      zIndex: 0,
    },
    topBar: {
      position: "absolute",
      left: 16,
      right: 16,
      zIndex: 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stickyHeader: {
      zIndex: 20,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    contentContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -100,
      backgroundColor: theme.colors.background,
      paddingTop: 16,
      paddingHorizontal: 10,
    },
  });
