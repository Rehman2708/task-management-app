import { Text, View } from "react-native";
import { dimensions, Row, Spacer } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { commonStyles } from "../styles/commonstyles";
import Swiper from "./swiper";

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
            borderRadius: 26,
            maxWidth: dimensions.width - 120,
            borderBottomLeftRadius: isMyChat ? 26 : repeated ? 26 : 16,
            borderBottomRightRadius: !isMyChat ? 26 : repeated ? 26 : 16,
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
