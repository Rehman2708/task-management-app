import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../enums/routes";
import { isDarkMode, Row, Spacer } from "../tools";
import { theme } from "../infrastructure/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHelper } from "../utils/helper";

export interface TabIconProps {
  isFocused: boolean;
  routeName: keyof typeof ROUTES;
}

const TabIcon: React.FC<TabIconProps> = ({ isFocused, routeName }) => {
  const icons: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "book-outline",
    [ROUTES.HISTORY]: "time-outline",
    [ROUTES.REELS]: "heart-outline",
    [ROUTES.NOTES]: "document-text-outline",
    [ROUTES.PROFILE]: "person-outline",
  };

  const activeIcons: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "book",
    [ROUTES.HISTORY]: "time",
    [ROUTES.REELS]: "heart",
    [ROUTES.NOTES]: "document-text",
    [ROUTES.PROFILE]: "person",
  };

  const iconName = isFocused ? activeIcons[routeName] : icons[routeName];
  const { themeColor } = useHelper();
  return (
    <Ionicons
      name={iconName}
      size={24}
      color={
        iconName === "heart"
          ? "red"
          : isFocused
          ? themeColor?.dark ?? theme.colors.primary
          : theme.colors.border
      }
    />
  );
};

const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const styles = useBottomTabStyles();
  const routeTitles: Record<keyof typeof ROUTES, string> = {
    [ROUTES.TASKS]: "Tasks",
    [ROUTES.HISTORY]: "History",
    [ROUTES.REELS]: "Reels",
    [ROUTES.NOTES]: "Notes",
    [ROUTES.PROFILE]: "Profile",
  };
  const { themeColor } = useHelper();
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
              />
              <Spacer size={8} />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && {
                    ...styles.tabLabelFocused,
                    color: themeColor?.dark ?? theme.colors.primary,
                  },
                ]}
              >
                {routeTitles[route.name as keyof typeof ROUTES] || route.name}
              </Text>
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
};

const useBottomTabStyles = () => {
  return StyleSheet.create({
    container: {
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
    },
    tabBarContainer: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 15,
      paddingBottom: 18,
      paddingTop: 15,
    },
    tab: {
      alignItems: "center",
    },
    tabLabel: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.border,
      // width: 85,
      textAlign: "center",
      fontFamily: theme.fonts.regular,
    },
    tabLabelFocused: {
      fontFamily: theme.fonts.semibold,
    },
  });
};

export default CustomTabBar;
