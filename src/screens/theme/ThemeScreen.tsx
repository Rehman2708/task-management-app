import { View, TouchableOpacity } from "react-native";
import { Column } from "../../tools";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import {
  getDataFromAsyncStorage,
  storeDataInAsyncStorage,
} from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";

const colors = [
  { dark: "#3F87E9", light: "#6697D9" },
  { dark: "#22B08D", light: "#83C0B1" },
  { dark: "#F6454B", light: "#FFA6B5" },
  { dark: "#FF7C0A", light: "#FFB259" },
  { dark: "#EA39E2", light: "#EA7AE4" },
];

const ThemeScreen = () => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const navigation = useNavigation();
  const setTheme = async (index: number) => {
    const selectedTheme = colors[index];
    setCurrentThemeIndex(index);

    try {
      await storeDataInAsyncStorage(LocalStorageKey.COLOR, selectedTheme);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.SPLASH }],
        })
      );
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      const { data } = await getDataFromAsyncStorage(LocalStorageKey.COLOR);

      if (data?.dark && data?.light) {
        // Find the index of the saved theme in the colors array
        const index = colors.findIndex(
          (theme) => theme.dark === data.dark && theme.light === data.light
        );

        if (index !== -1) {
          setCurrentThemeIndex(index);
        }
      }
    };

    loadTheme();
  }, []);

  return (
    <ScreenWrapper title="Theme" showBackbutton>
      <Column gap={12} style={[commonStyles.screenWrapper]}>
        {colors.map((item, index) => (
          <TouchableOpacity
            style={{
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 3,
              borderColor: currentThemeIndex === index ? "#000" : "#fff",
            }}
            key={index}
            onPress={() => setTheme(index)}
          >
            <LinearGradient
              colors={[item.dark, item.light]}
              style={{
                height: 100,
                width: "100%",
              }}
            />
          </TouchableOpacity>
        ))}
      </Column>
    </ScreenWrapper>
  );
};

export default ThemeScreen;
