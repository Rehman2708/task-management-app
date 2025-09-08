import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../infrastructure/theme";
import { isAndroid } from "../tools";
import { useHelper } from "../utils/helper";

const LinearHeader = () => {
  const { themeColor } = useHelper();
  return (
    <View>
      <LinearGradient
        colors={[
          themeColor.dark ?? theme.colors.primary,
          themeColor.light ?? theme.colors.secondary,
        ]}
        style={{
          height: isAndroid ? 80 : 130,
          width: "100%",
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 2 }}
        locations={[0.2, 0.65]}
      />
    </View>
  );
};

export default LinearHeader;
