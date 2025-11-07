import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../enums/routes";
import { dimensions, isDarkMode, Row, Spacer } from "../tools";
import { useTheme } from "../infrastructure/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHelper } from "../utils/helper";
import { useUtilStore } from "../store/utils";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export interface TabIconProps {
  isFocused: boolean;
  routeName: keyof typeof ROUTES;
  theme: any;
  onPress: any;
}

const TabIcon: React.FC<TabIconProps> = ({
  isFocused,
  routeName,
  theme,
  onPress,
}) => {
  const icons: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "book-outline",
    [ROUTES.REELS]: "heart-outline",
    [ROUTES.NOTES]: "document-text-outline",
    [ROUTES.LISTS]: "list-circle-outline",
    [ROUTES.PROFILE]: "person-outline",
  };

  const activeIcons: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "book",
    [ROUTES.REELS]: "heart",
    [ROUTES.NOTES]: "document-text",
    [ROUTES.LISTS]: "list-circle",
    [ROUTES.PROFILE]: "person",
  };

  const iconName = isFocused ? activeIcons[routeName] : icons[routeName];
  const { themeColor } = useHelper();

  // Animation for icon scale
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(1.2, { damping: 7, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 7, stiffness: 200 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[{ paddingHorizontal: 6,paddingVertical:2 }, animatedStyle]}>
        <Ionicons
          name={iconName}
          size={26}
          color={
            iconName === "heart"
              ? "red"
              : isFocused
              ? themeColor?.dark ?? theme.colors.primary
              : theme.colors.textLight
          }
        />
      </Animated.View>
    </Pressable>
  );
};

const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const { refetchLists, refetchTask, refetchNotes, refetchReels } =
    useUtilStore();
  const styles = useBottomTabStyles(theme);
  const routeTitles: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "Tasks",
    [ROUTES.REELS]: "Reels",
    [ROUTES.NOTES]: "Notes",
    [ROUTES.LISTS]: "Lists",
    [ROUTES.PROFILE]: "Profile",
  };
  const { themeColor, triggerVibration } = useHelper();

  return (
    <View style={styles.container}>
      <Row justifyContent="space-between" style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const handleNavigation = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, {
                screen: route.name,
                isBottomTab: true,
              });
            } else {
              if (route.name === ROUTES.REELS) {
                triggerVibration("light");
                refetchReels();
              }
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={handleNavigation}
              accessibilityRole="button"
              accessibilityLabel={
                descriptors[route.key].options.tabBarAccessibilityLabel
              }
              testID={descriptors[route.key].options.tabBarTestID}
              style={styles.tab}
            >
              <TabIcon
                isFocused={isFocused}
                routeName={route.name as keyof typeof ROUTES}
                theme={theme}
                onPress={handleNavigation}
              />
              {/* <Spacer size={8} />
              <AnimatedLabel
                label={
                  routeTitles[route.name as keyof typeof ROUTES] || route.name
                }
                isFocused={isFocused}
                theme={theme}
              /> */}
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
};

// Animated label component
const AnimatedLabel: React.FC<{
  label: string;
  isFocused: boolean;
  theme: any;
}> = ({ label, isFocused, theme }) => {
  const { themeColor } = useHelper();
  const scale = useSharedValue(isFocused ? 1.1 : 1);
  const styles = useBottomTabStyles(theme);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 7,
      stiffness: 150,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: isFocused
      ? themeColor?.dark ?? theme.colors.primary
      : theme.colors.textLight,
  }));

  return (
    <Animated.Text style={[styles.label, animatedStyle]}>{label}</Animated.Text>
  );
};

const useBottomTabStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: `${theme.colors.border}`,
      backgroundColor: `${theme.colors.background}aa`,
      position: "absolute",
      width: dimensions.width - 100,
      bottom: 0,
      marginHorizontal: 50,
      marginBottom: 10,
      borderRadius: 100,
      overflow: "hidden",
      elevation: 20,
    },
    tabBarContainer: {
      // backgroundColor: theme.colors.background,
      paddingHorizontal: 15,
      paddingBottom: 18,
      paddingTop: 15,
    },
    tab: {
      alignItems: "center",
    },
    label: {
      fontSize: theme.fontSizes.sm,
      textAlign: "center",
      fontFamily: theme.fonts.medium,
    },
  });
};

export default CustomTabBar;
