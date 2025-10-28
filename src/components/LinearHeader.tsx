import { Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../infrastructure/theme";
import { isAndroid } from "../tools";
import { useHelper } from "../utils/helper";
import { useCommonStyles } from "../styles/commonstyles";

const LinearHeader = ({ image }: { image?: string }) => {
  const { themeColor, loggedInUser } = useHelper();
  const imageUri = image ?? loggedInUser?.image;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  return (
    <View>
      <LinearGradient
        colors={
          imageUri
            ? ["#000000cc", "#000000cc"]
            : [
                themeColor?.dark ?? theme.colors.primary,
                themeColor?.light ?? theme.colors.secondary,
              ]
        }
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
      >
        {imageUri?.trim() !== "" && (
          <Image
            source={{ uri: imageUri }}
            style={[
              commonStyles.fullFlex,
              {
                borderBottomLeftRadius: 40,
                borderBottomRightRadius: 40,
                opacity: 0.3,
              },
            ]}
          />
        )}
      </LinearGradient>
    </View>
  );
};

export default LinearHeader;
