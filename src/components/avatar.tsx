import React from "react";
import { Text, Image } from "react-native";
import { useHelper } from "../utils/helper";
import { Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";

interface AvatarProps {
  image?: string | null;
  name: string;
  withName?: boolean;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  image,
  name,
  withName = false,
  size = 16,
}) => {
  const { getInitials, themeColor, loggedInUser } = useHelper();
  const inverted = loggedInUser?.userId === name;
  return (
    <Row alignItems="center" gap={size / 3}>
      {image ? (
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          style={[{ width: size, height: size, borderRadius: size / 2 }]}
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
                color: inverted ? themeColor.light : themeColor?.dark,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </Row>
      )}

      {withName && (
        <Text
          style={[commonStyles.tTinyText, { fontSize: size * 0.6 }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      )}
    </Row>
  );
};

export default Avatar;
