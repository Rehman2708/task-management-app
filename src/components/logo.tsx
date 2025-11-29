import { Image } from "react-native";

const Logo = ({ height }: { height?: number }) => {
  return (
    <Image
      style={{
        height: height && height > 0 ? height + 50 : 300,
        width: "100%",
        marginBottom: 20,
      }}
      resizeMode="contain"
      source={require("../../assets/images/androidLogo.png")}
    />
  );
};

export default Logo;
