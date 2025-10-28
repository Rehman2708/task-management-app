export const FontAsset = {
  MontserratAlternateBold: require("./MontserratAlternates-Bold.ttf"),
  MontserratAlternateLight: require("./MontserratAlternates-Light.ttf"),
  MontserratAlternateMedium: require("./MontserratAlternates-Medium.ttf"),
  MontserratAlternateRegular: require("./MontserratAlternates-Regular.ttf"),
  MontserratAlternateSemiBold: require("./MontserratAlternates-SemiBold.ttf"),
  MontserratBold: require("./Montserrat-Bold.ttf"),
  MontserratLight: require("./Montserrat-Light.ttf"),
  MontserratMedium: require("./Montserrat-Medium.ttf"),
  MontserratRegular: require("./Montserrat-Regular.ttf"),
  MontserratSemiBold: require("./Montserrat-SemiBold.ttf"),
  SourGummyBold: require("./SourGummy-Bold.ttf"),
  SourGummyLight: require("./SourGummy-Light.ttf"),
  SourGummyMedium: require("./SourGummy-Medium.ttf"),
  SourGummyRegular: require("./SourGummy-Regular.ttf"),
  SourGummySemiBold: require("./SourGummy-SemiBold.ttf"),
  TangerineRegular: require("./Tangerine-Regular.ttf"),
  TangerineBold: require("./Tangerine-Bold.ttf"),
};

export const fontMap = {
  Montserrat: {
    light: "MontserratLight",
    regular: "MontserratRegular",
    medium: "MontserratMedium",
    semibold: "MontserratSemiBold",
    bold: "MontserratBold",
  },
  MontserratAlternate: {
    light: "MontserratAlternateLight",
    regular: "MontserratAlternateRegular",
    medium: "MontserratAlternateMedium",
    semibold: "MontserratAlternateSemiBold",
    bold: "MontserratAlternateBold",
  },
  SourGummy: {
    light: "SourGummyLight",
    regular: "SourGummyRegular",
    medium: "SourGummyMedium",
    semibold: "SourGummySemiBold",
    bold: "SourGummyBold",
  },
} as const;

export type FontName = keyof typeof fontMap;
