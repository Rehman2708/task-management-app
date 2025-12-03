import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import {
  getNotificationPermission,
  handleNotificationNavigation,
  navigationRef,
} from "./notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCommonStyles } from "./src/styles/commonstyles";
import { FontAsset } from "./assets/fonts";
import { useTheme } from "./src/infrastructure/theme";
import { StatusBar } from "react-native";
import * as Notifications from "expo-notifications";
import { useNotificationStore } from "./src/store/notificationStore";
import { useNetwork } from "./src/utils/useNetwork";
import OfflineScreen from "./src/screens/OfflineScreen/OfflineScreen";
import * as NavigationBar from "expo-navigation-bar";
import { isAndroid } from "./src/tools";
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
  const isConnected = useNetwork();
  const {
    launchedFromNotification,
    setLaunchedFromNotification,
    clearLaunchedFromNotification,
  } = useNotificationStore();

  useEffect(() => {
    getNotificationPermission();
  }, []);

  // ✅ Handle notification taps (foreground, background, or killed state)
  useEffect(() => {
    const setupNotifications = async () => {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();

      if (lastResponse?.notification) {
        const data = lastResponse.notification.request.content.data;
        if (data) setLaunchedFromNotification(data);
      }

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response?.notification?.request?.content?.data;
          if (navigationRef.isReady()) handleNotificationNavigation(data);
          else setLaunchedFromNotification(data);
        });

      return () => {
        responseListener.remove();
      };
    };
    if (isAndroid) {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    setupNotifications();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (launchedFromNotification) {
            // handleNotificationNavigation(launchedFromNotification);
            clearLaunchedFromNotification();
          }
        }}
      >
        <StatusBar backgroundColor={"#00000030"} translucent />
        {!isConnected ? <OfflineScreen /> : <AppNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
