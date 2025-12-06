import { Image } from "react-native";
import { isDarkMode } from "../tools";

const Logo = ({ height }: { height?: number }) => {
  return (
    <Image
      style={{
        height: height && height > 0 ? height : 250,
        width: "100%",
        marginBottom: 20,
      }}
      resizeMode="contain"
      source={
        isDarkMode
          ? require("../../assets/images/androidLogo2.png")
          : require("../../assets/images/androidLogo1.png")
      }
    />
  );
};

export default Logo;
