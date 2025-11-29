import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import { dimensions, Row, Spacer } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";
import ImageView from "react-native-image-viewing";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const CommentCard = ({
  text,
  image,
  name,
  time,
  userId,
  repeated,
  url,
  noImage,
  loading,
}: {
  text?: string;
  image?: string;
  name: string;
  userId: string;
  time: string;
  repeated?: boolean;
  noImage?: boolean;
  loading?: boolean;
  url?: string;
}) => {
  const { loggedInUser, themeColor, getImageSize } = useHelper();
  const isMyChat = loggedInUser?.userId === userId;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const isSingleEmoji = () =>
    !!text && /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u.test(text.trim());

  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (url) {
      getImageSize(url)
        .then(({ width, height }) => {
          const maxWidth = dimensions.width * 0.55;
          const scale = maxWidth / width;
          setImgSize({ w: maxWidth, h: height * scale });
        })
        .catch(() => {
          setImgSize({ w: dimensions.width * 0.55, h: 250 });
        });
    }
  }, [url]);

  return (
    <Row
      gap={8}
      justifyContent={isMyChat ? "flex-end" : "flex-start"}
      alignItems={isSingleEmoji() ? "center" : "flex-start"}
      style={{ marginTop: repeated ? 3 : 8 }}
    >
      {!isMyChat &&
        !noImage &&
        (repeated ? (
          <Spacer size={26} position="right" />
        ) : (
          <Avatar
            size={26}
            name={loggedInUser?.partner?.name}
            image={loggedInUser?.partner?.image}
          />
        ))}

      {url ? (
        <Pressable
          onPress={() => setShowImage(true)}
          style={{
            width: imgSize?.w ?? dimensions.width * 0.55,
            height: imgSize?.h ?? 220, // RESERVE SPACE
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: isMyChat
              ? `${themeColor.dark}`
              : `${theme.colors.border}`,
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
          }}
        >
          {!imgLoaded && <ActivityIndicator size="small" color="#999" />}

          {imgSize && (
            <Image
              source={{ uri: url }}
              style={{
                width: "100%",
                height: "100%",
                opacity: imgLoaded ? 1 : 0,
                borderRadius: 6,
              }}
              resizeMode="contain"
              onLoad={() => setImgLoaded(true)}
            />
          )}

          <Text
            style={[
              commonStyles.tTinyText,
              {
                color: theme.colors.white,
                textAlign: "right",
                position: "absolute",
                bottom: 8,
                right: 10,
              },
            ]}
          >
            {time}
          </Text>

          <ImageView
            images={[{ uri: url }]}
            visible={showImage}
            onRequestClose={() => setShowImage(false)}
            presentationStyle="overFullScreen"
            swipeToCloseEnabled
            backgroundColor={theme.colors.background}
            imageIndex={0}
          />
        </Pressable>
      ) : isSingleEmoji() ? (
        <Text style={{ fontSize: 36 }}>{text}</Text>
      ) : (
        <View
          style={{
            backgroundColor: isMyChat ? themeColor.dark : theme.colors.border,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 16,
            maxWidth: dimensions.width - 120,
            borderBottomLeftRadius: isMyChat ? 16 : repeated ? 16 : 6,
            borderBottomRightRadius: !isMyChat ? 16 : repeated ? 16 : 6,
          }}
        >
          <Text style={[commonStyles.smallText, { color: theme.colors.white }]}>
            {text}
          </Text>
          <Text
            style={[
              commonStyles.tTinyText,
              {
                color: theme.colors.white,
                textAlign: "right",
                marginTop: 2,
              },
            ]}
          >
            {time}
            {loading && (
              <>
                {`  `}
                <Ionicons
                  name="time-outline"
                  size={10}
                  color={theme.colors.white}
                />
              </>
            )}
          </Text>
        </View>
      )}

      {isMyChat &&
        !noImage &&
        (repeated ? (
          <Spacer size={26} position="right" />
        ) : (
          <Avatar
            size={26}
            name={loggedInUser?.name}
            image={loggedInUser?.image}
          />
        ))}
    </Row>
  );
};

export default CommentCard;
