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

export default function App() {
  const [fontsLoaded] = useFonts(FontAsset);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  useEffect(() => {
    getNotificationPermission();
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
      <NavigationContainer>
        <StatusBar backgroundColor={"#00000030"} translucent />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
