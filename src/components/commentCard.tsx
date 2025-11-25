import { Text, View, Image, Pressable } from "react-native";
import { dimensions, Row, Spacer } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";
import ImageView from "react-native-image-viewing";
import { useEffect, useState } from "react";

const CommentCard = ({
  text,
  image,
  name,
  time,
  userId,
  repeated,
  url,
}: {
  text?: string;
  image?: string;
  name: string;
  userId: string;
  time: string;
  repeated?: boolean;
  url?: string;
}) => {
  const { loggedInUser, themeColor, getImageSize } = useHelper();
  const isMyChat = loggedInUser?.userId === userId;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const isSingleEmoji = (): boolean => {
    if (!text) return false;
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
    return emojiRegex.test(text.trim());
  };
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (url) {
      getImageSize(url)
        .then(({ width, height }) => {
          const maxWidth = dimensions.width * 0.55;
          const scale = maxWidth / width;
          setImgSize({
            w: maxWidth,
            h: height * scale,
          });
        })
        .catch(() => {
          setImgSize({ w: dimensions.width * 0.55, h: 250 }); // fallback
        });
    }
  }, [url]);

  const [showImage, setShowImage] = useState(false);

  return (
    <Row
      gap={8}
      justifyContent={isMyChat ? "flex-end" : "flex-start"}
      alignItems={isSingleEmoji() ? "center" : "flex-start"}
      style={{ marginTop: repeated ? 2 : 8 }}
    >
      {!isMyChat && (
        <>
          {repeated ? (
            <Spacer size={26} position="right" />
          ) : (
            <Avatar
              size={26}
              name={loggedInUser?.partner?.name}
              image={loggedInUser?.partner?.image}
            />
          )}
        </>
      )}
      {url ? (
        <>
          {imgSize && (
            <Pressable
              onPress={() => setShowImage(true)}
              style={{
                aspectRatio: imgSize.w / (imgSize.h + 16),
                maxHeight: 290,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: isMyChat
                  ? `${themeColor.dark}`
                  : `${theme.colors.border}`,
                padding: 4,
              }}
            >
              <Image
                source={{ uri: url }}
                style={{
                  flex: 1,
                  resizeMode: "contain",
                  borderRadius: 6,
                }}
              />
              <ImageView
                images={[{ uri: url }]}
                visible={showImage}
                onRequestClose={() => setShowImage(false)}
                presentationStyle="overFullScreen"
                swipeToCloseEnabled
                backgroundColor={theme.colors.background}
                imageIndex={0}
              />
              <Text
                style={[
                  commonStyles.tTinyText,
                  {
                    color: theme.colors.white,
                    textAlign: "right",
                    marginTop: 6,
                  },
                ]}
              >
                {time}
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          {isSingleEmoji() ? (
            <Text style={[{ fontSize: 36 }]}>{text}</Text>
          ) : (
            <View
              style={{
                backgroundColor: isMyChat
                  ? `${themeColor.dark}`
                  : `${theme.colors.border}`,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
                maxWidth: dimensions.width - 120,
                borderBottomLeftRadius: isMyChat ? 16 : repeated ? 16 : 6,
                borderBottomRightRadius: !isMyChat ? 16 : repeated ? 16 : 6,
              }}
            >
              <Text
                style={[commonStyles.smallText, { color: theme.colors.white }]}
              >
                {text}
              </Text>
              <Text
                style={[
                  commonStyles.tTinyText,
                  { color: theme.colors.white, textAlign: "right" },
                ]}
              >
                {time}
              </Text>
            </View>
          )}
        </>
      )}
      {isMyChat && (
        <>
          {repeated ? (
            <Spacer size={26} position="right" />
          ) : (
            <Avatar
              size={26}
              name={loggedInUser?.name}
              image={loggedInUser?.image}
            />
          )}
        </>
      )}
    </Row>
  );
};

export default CommentCard;
