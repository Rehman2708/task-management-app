import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "../store/authStore";

const useFonts = () => {
  const { user } = useAuthStore();
  const MontserratFonts = {
    light: "MontserratLight",
    regular: "MontserratRegular",
    medium: "MontserratMedium",
    semibold: "MontserratSemiBold",
    bold: "MontserratBold",
  };
  const MontserratAlternateFonts = {
    light: "MontserratAlternateLight",
    regular: "MontserratAlternateRegular",
    medium: "MontserratAlternateMedium",
    semibold: "MontserratAlternateSemiBold",
    bold: "MontserratAlternateBold",
  };
  const SourGummyFonts = {
    light: "SourGummyLight",
    regular: "SourGummyRegular",
    medium: "SourGummyMedium",
    semibold: "SourGummySemiBold",
    bold: "SourGummyBold",
  };
  if (user?.font === "Montserrat") return MontserratFonts;
  if (user?.font === "SourGummy") return SourGummyFonts;
  if (user?.font === "MontserratAlternate") return MontserratAlternateFonts;
};

export default useFonts;
