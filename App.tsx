import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import { getNotificationPermission } from "./notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { commonStyles } from "./src/styles/commonstyles";

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={commonStyles.fullFlex}>
      <NavigationContainer>
        <StatusBar backgroundColor={"black"} />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
