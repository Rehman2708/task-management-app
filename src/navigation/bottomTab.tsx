import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../enums/routes";
import { isDarkMode, Row, Spacer } from "../tools";
import { useTheme } from "../infrastructure/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHelper } from "../utils/helper";
import { useUtilStore } from "../store/utils";

export interface TabIconProps {
  isFocused: boolean;
  routeName: keyof typeof ROUTES;
  theme: any;
}

const TabIcon: React.FC<TabIconProps> = ({ isFocused, routeName, theme }) => {
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

  return (
    <Ionicons
      name={iconName}
      size={24}
      color={
        iconName === "heart"
          ? "red"
          : isFocused
          ? themeColor?.dark ?? theme.colors.primary
          : theme.colors.textLight
      }
    />
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
              // if (route.name === ROUTES.TASKS) {
              //               refetchTask();
              //             } else if (route.name === ROUTES.NOTES) {
              //               refetchNotes();
              //             } else if (route.name === ROUTES.LISTS) {
              //               refetchLists();
              //             } else

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

const useBottomTabStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: `${theme.colors.border}`,
      backgroundColor: theme.colors.background,
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
      color: theme.colors.textLight,
      textAlign: "center",
      fontFamily: theme.fonts.regular,
    },
    tabLabelFocused: {
      fontFamily: theme.fonts.semibold,
    },
  });
};

export default CustomTabBar;
