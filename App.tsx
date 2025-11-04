import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  handleNotificationNavigation,
  navigationRef,
  pendingNotificationData,
  setLaunchedFromNotification,
} from "./notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCommonStyles } from "./src/styles/commonstyles";
import { FontAsset } from "./assets/fonts";
import { useTheme } from "./src/infrastructure/theme";
import { StatusBar } from "react-native";
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
  const [initialData, setInitialData] = useState<any>(null);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  useEffect(() => {
    getNotificationPermission();
  }, []);

  // ✅ Handle notification taps (foreground, background, killed)
  useEffect(() => {
    const setupNotifications = async () => {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();

      if (lastResponse?.notification) {
        const data = lastResponse.notification.request.content.data;
        if (data) {
          setLaunchedFromNotification(true);
          setInitialData(data);
          setLaunchedFromNotification(false);
        }
      }

      // Foreground or background taps
      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response?.notification?.request?.content?.data;
          if (navigationRef.isReady()) handleNotificationNavigation(data);
          else setInitialData(data);
        });

      return () => {
        responseListener.remove();
      };
    };

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
          if (initialData) {
            handleNotificationNavigation(initialData);
            setInitialData(null);
          }
        }}
      >
        <StatusBar backgroundColor={"#00000030"} translucent />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
