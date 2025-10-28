import React from "react";
import { Text, Image, Pressable } from "react-native";
import { useHelper } from "../utils/helper";
import { Row, Spacer } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../enums/routes";
import { useTheme } from "../infrastructure/theme";

interface AvatarProps {
  image?: string | null;
  name?: string;
  withName?: boolean;
  size?: number;
  disabled?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  image,
  name,
  withName = false,
  size = 16,
  disabled,
}) => {
  const { getInitials, themeColor, loggedInUser } = useHelper();
  const inverted = loggedInUser?.userId === name || loggedInUser?.name === name;
  const navigation: any = useNavigation();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => navigation.navigate(ROUTES.PROFILE)}
    >
      <Row alignItems="center">
        {image ? (
          <Image
            source={{ uri: image }}
            resizeMode="cover"
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: themeColor.light,
              },
            ]}
          />
        ) : (
          <Row
            justifyContent="center"
            alignItems="center"
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: inverted
                  ? themeColor.dark
                  : `${themeColor?.light}`,
              },
            ]}
          >
            <Text
              style={[
                commonStyles.titleText,
                {
                  fontSize: size / 2,
                  color: "#fff",
                },
              ]}
            >
              {getInitials(name)}
            </Text>
          </Row>
        )}

        {withName && (
          <>
            <Spacer size={size / 3} position="right" />
            <Text
              style={[commonStyles.tTinyText, { fontSize: size * 0.6 }]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </>
        )}
      </Row>
    </Pressable>
  );
};

export default Avatar;
