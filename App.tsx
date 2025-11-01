import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { getNotificationPermission } from "./notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCommonStyles } from "./src/styles/commonstyles";
import { FontAsset } from "./assets/fonts";
import { useTheme } from "./src/infrastructure/theme";
import { StatusBar } from "react-native";
import {
  handleNotificationNavigation,
  navigationRef,
} from "./src/utils/navigation";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts(FontAsset);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  useEffect(() => {
    getNotificationPermission();
  }, []);

  useEffect(() => {
    let isReady = false;
    const timer = setTimeout(() => {
      isReady = true;
    }, 500);

    const subscription = Notifications.addNotificationReceivedListener(
      () => {}
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notData = response?.notification?.request?.content?.data;
        if (isReady) handleNotificationNavigation(notData);
        else setTimeout(() => handleNotificationNavigation(notData), 500);
      });

    return () => {
      clearTimeout(timer);
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={[
        commonStyles.fullFlex,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <NavigationContainer ref={navigationRef}>
        <StatusBar backgroundColor={"#00000030"} translucent />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
