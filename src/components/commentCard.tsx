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
      <Row gap={8} justifyContent={isMyChat ? "flex-end" : "flex-start"}>
        {!isMyChat && (
          <>
            {repeated ? (
              <Spacer size={26} position="right" />
            ) : (
              <Avatar size={26} name={name} image={image} />
            )}
          </>
        )}
        <View
          style={{
            backgroundColor: isMyChat
              ? `${themeColor.light}`
              : `${themeColor.dark}`,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 16,
            maxWidth: dimensions.width - 120,
            borderBottomLeftRadius: isMyChat ? 16 : repeated ? 16 : 6,
            borderBottomRightRadius: !isMyChat ? 16 : repeated ? 16 : 6,
          }}
        >
          <Text style={[commonStyles.smallText, { color: "#fff" }]}>
            {text}
          </Text>
        </View>
        {isMyChat && (
          <>
            {repeated ? (
              <Spacer size={26} position="right" />
            ) : (
              <Avatar size={26} name={name} image={image} />
            )}
          </>
        )}
      </Row>
    </Swiper>
  );
};

export default CommentCard;
