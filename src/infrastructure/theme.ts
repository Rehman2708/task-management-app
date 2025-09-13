import { isAndroid, isDarkMode } from "../tools";

export const theme = {
  colors: {
    primary: "#3F87E9",
    secondary: "#6697D9",
    background: isDarkMode ? "#070A1B" : "#ffffff",
    text: isDarkMode ? "#c9c7ba" : "#29292b",
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
  fonts: {
    light: "MontserratLight",
    regular: "MontserratRegular",
    medium: "MontserratMedium",
    semibold: "MontserratSemiBold",
    bold: "MontserratBold",
  },
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
