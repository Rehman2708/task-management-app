import { Text, View } from "react-native";
import { dimensions, Row } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { commonStyles } from "../styles/commonstyles";

const CommentCard = ({
  text,
  image,
  name,
  time,
  userId,
}: {
  text: string;
  image?: string;
  name: string;
  userId: string;
  time: string;
}) => {
  const { loggedInUser, themeColor } = useHelper();
  const isMyChat = loggedInUser?.userId === userId;
  return (
    <Row
      gap={8}
      justifyContent={isMyChat ? "flex-end" : "flex-start"}
      style={{
        marginVertical: 6,
      }}
    >
      {!isMyChat && <Avatar size={26} name={name} image={image} />}
      <View
        style={{
          backgroundColor: isMyChat
            ? `${themeColor.light}60`
            : `${themeColor.light}30`,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 100,
          maxWidth: dimensions.width - 120,
          borderTopLeftRadius: isMyChat ? 100 : 50,
          borderTopRightRadius: !isMyChat ? 100 : 50,
        }}
      >
        <Text style={[commonStyles.smallText]}>{text}</Text>
      </View>
      {isMyChat && <Avatar size={26} name={name} image={image} />}
    </Row>
  );
};

export default CommentCard;
