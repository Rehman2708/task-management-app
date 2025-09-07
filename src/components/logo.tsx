import { Image } from "react-native";

const Logo = () => {
  return (
    <Image
      style={{ height: 100, width: "100%", marginBottom: 20 }}
      resizeMode="contain"
      source={require("../../assets/images/logo2.png")}
    />
  );
};

export default Logo;
