import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
export default function App() {
  const [fontsLoaded] = useFonts({
    MontserratBold: require("./assets/fonts/MontserratAlternates-Bold.ttf"),
    MontserratLight: require("./assets/fonts/MontserratAlternates-Light.ttf"),
    MontserratMedium: require("./assets/fonts/MontserratAlternates-Medium.ttf"),
    MontserratRegular: require("./assets/fonts/MontserratAlternates-Regular.ttf"),
    MontserratSemiBold: require("./assets/fonts/MontserratAlternates-SemiBold.ttf"),
  });
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={"black"} />
      <AppNavigator />
    </NavigationContainer>
  );
}
