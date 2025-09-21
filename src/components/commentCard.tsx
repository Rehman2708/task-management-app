import { Text, View } from "react-native";
import { dimensions, Row } from "../tools";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import { commonStyles } from "../styles/commonstyles";
import { Swipeable } from "react-native-gesture-handler";
import { useRef } from "react";
import Swiper from "./swiper";

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
  const swipeableRef = useRef<Swipeable>(null);

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

  const handleSwipeOpen = () => {
    setTimeout(() => {
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
    }, 2000);
  };

  return (
    <Swiper
      rightAction={isMyChat ? renderAction : undefined}
      leftAction={!isMyChat ? renderAction : undefined}
      containerStyle={{ marginVertical: 6 }}
    >
      <Row gap={8} justifyContent={isMyChat ? "flex-end" : "flex-start"}>
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
    </Swiper>
  );
};

export default CommentCard;
