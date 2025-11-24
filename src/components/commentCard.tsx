import { Text, View } from "react-native";
import { dimensions, Row, Spacer } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { useCommonStyles } from "../styles/commonstyles";
import Swiper from "./swiper";
import { useTheme } from "../infrastructure/theme";

const CommentCard = ({
  text,
  image,
  name,
  time,
  userId,
  repeated,
}: {
  text: string;
  image?: string;
  name: string;
  userId: string;
  time: string;
  repeated?: boolean;
}) => {
  const { loggedInUser, themeColor } = useHelper();
  const isMyChat = loggedInUser?.userId === userId;
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const isSingleEmoji = (): boolean => {
    if (!text) return false;
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
    return emojiRegex.test(text.trim());
  };

  const renderAction = () => (
    <View
      style={{
        height: 26,
        justifyContent: "center",
        marginRight: !isMyChat ? 12 : 0,
        marginLeft: isMyChat ? 12 : 0,
      }}
    >
      <Text style={[commonStyles.tTinyText]}>{time}</Text>
    </View>
  );

  return (
    <Swiper
      rightAction={isMyChat ? renderAction : undefined}
      leftAction={!isMyChat ? renderAction : undefined}
      containerStyle={{ marginTop: repeated ? 2 : 8 }}
    >
      <Row
        gap={8}
        justifyContent={isMyChat ? "flex-end" : "flex-start"}
        alignItems={isSingleEmoji() ? "center" : "flex-start"}
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
          </View>
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
    </Swiper>
  );
};

export default CommentCard;
