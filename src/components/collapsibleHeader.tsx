import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "./CustomHeader";
import { Spacer } from "../tools";
import ImageView from "react-native-image-viewing";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../infrastructure/theme";
import { useCommonStyles } from "../styles/commonstyles";

const { width: screenWidth } = Dimensions.get("window");
export const HEADER_MAX_HEIGHT = 250;
export const HEADER_MIN_HEIGHT = 0;

interface CollapsibleHeaderTabsProps {
  headerHeight?: number;
  headerImage?: string;
  title: string;
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
  const styles = collapsibleHeaderStyle(theme);
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const [showImage, setShowImage] = useState(false);

  const HEADER_SCROLL_DISTANCE = headerHeight - HEADER_MIN_HEIGHT;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => (scrollY.value = event.contentOffset.y),
  });

  const headerImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-200, 0],
      [2, 1],
      Extrapolate.CLAMP
    );
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [headerHeight, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height, transform: [{ scale }] };
  });

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [-50, 0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      [1, 0, 0, 1]
    ),
  }));

  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE / 1.4],
      [0, 1],
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
  const animatedBackButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE / 1.4],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));
  return (
    <>
      {/* Header Image */}
      <Animated.View style={[styles.headerContainer, headerImageStyle]}>
        {headerImage ? (
          <ImageBackground
            source={{ uri: headerImage }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <ImageBackground
            source={{ uri: user?.image }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        )}
        <Animated.View style={[commonStyles.fullFlex, blurStyle]}>
          <BlurView intensity={100} tint="dark" style={commonStyles.fullFlex} />
        </Animated.View>
      </Animated.View>

      {/* Top Navigation Bar */}
      <Animated.View style={[styles.topBar, animatedBackButtonStyle]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back-outline"
            size={30}
            color={theme.colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowImage(true)}
          style={styles.backButton}
        >
          <Ionicons
            name="expand-outline"
            size={30}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
        <CustomHeader
          subTitle={subTitle}
          title={title}
          showBackbutton
          hideNotificationButton
        />
      </Animated.View>

      {/* Keyboard + Scroll Handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            ) : undefined
          }
          contentContainerStyle={{
            paddingTop: headerHeight - 56,
            paddingBottom: Platform.OS === "ios" ? 100 : 0,
          }}
        >
          <View style={[commonStyles.screenWrapper, styles.contentContainer]}>
            <Text numberOfLines={3} style={commonStyles.titleText}>
              {title}
            </Text>
            <Spacer size={6} />
            {subTitle && (
              <Text numberOfLines={3} style={commonStyles.tinyText}>
                {subTitle}
              </Text>
            )}
            <Spacer size={16} />
            {children}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <ImageView
        images={[{ uri: headerImage }]}
        imageIndex={0}
        visible={showImage}
        onRequestClose={() => setShowImage(false)}
      />
    </>
  );
};

export default CollapsibleHeaderTabs;

const collapsibleHeaderStyle = (theme: any) =>
  StyleSheet.create({
    headerContainer: {
      width: screenWidth,
      position: "absolute",
      top: 0,
      zIndex: 0, // ensure it's below the topBar
    },
    topBar: {
      position: "absolute",
      left: 16,
      right: 16,
      zIndex: 30, // higher than header image
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      paddingVertical: 16,
    },
    stickyHeader: {
      paddingVertical: 12,
      zIndex: 20,
    },
    contentContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -36,
      backgroundColor: theme.colors.background,
      paddingTop: 16,
      paddingHorizontal: 10,
    },
  });
