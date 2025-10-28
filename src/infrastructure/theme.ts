// theme.ts
import { fontMap, FontName } from "../../assets/fonts";
import { useAuthStore } from "../store/authStore";
import { isDarkMode } from "../tools";

export function useTheme() {
  const { user } = useAuthStore();

  const getFonts = (fontName: FontName) =>
    fontMap[fontName] || fontMap.Montserrat;

  return {
    colors: {
      primary: "#3F87E9",
      secondary: "#6697D9",
      background: isDarkMode ? "#0e0e0e" : "#ffffff",
      text: isDarkMode ? "#c9c7ba" : "#29292b",
      textLight: isDarkMode ? "#c9c7ba99" : "#29292b99",
      border: isDarkMode ? "#333" : "#cccccc",
      error: "#EC5454",
      success: "#38B000",
      warning: "#ffa500",
      transparent: "transparent",
      white: "#ffffff",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    fonts: getFonts((user?.font as FontName) || "Montserrat"),
    fontSizes: {
      xxs: 10,
      xs: 12,
      sm: 14,
      md: 15,
      lg: 17,
      xl: 20,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  };
}
