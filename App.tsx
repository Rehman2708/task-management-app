import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import { getNotificationPermission } from "./notification";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    MontserratBold: require("./assets/fonts/MontserratAlternates-Bold.ttf"),
    MontserratLight: require("./assets/fonts/MontserratAlternates-Light.ttf"),
    MontserratMedium: require("./assets/fonts/MontserratAlternates-Medium.ttf"),
    MontserratRegular: require("./assets/fonts/MontserratAlternates-Regular.ttf"),
    MontserratSemiBold: require("./assets/fonts/MontserratAlternates-SemiBold.ttf"),
  });

  useEffect(() => {
    getNotificationPermission();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor={"black"} />
      <AppNavigator />
    </NavigationContainer>
  );
}
