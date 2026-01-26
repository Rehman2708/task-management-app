import {
  Text,
  Image,
  ViewStyle,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Column, Row, Spacer } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { useHelper } from "../utils/helper";
import Avatar from "./avatar";
import Swiper from "./swiper";
import { Ionicons } from "@expo/vector-icons";
import CardWrapper from "./cardWrapper";
import { useTheme } from "../infrastructure/theme";
import { CalendarEvent } from "../types/calendar";
import { useCallback } from "react";

const EventCard = ({
  item,
  containerStyle,
  onEdit,
  onDelete,
}: {
  item: CalendarEvent;
  containerStyle?: ViewStyle;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}) => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const { formatDate, themeColor } = useHelper();

  const createLocalDate = useCallback((dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, []);
  // Helper functions (memoized for performance)
  const getLocalDateString = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getRemainingDays = useCallback(
    (eventDate: string) => {
      const today = new Date();
      const todayString = getLocalDateString(today);
      const eventDateString = getLocalDateString(eventDate);

      const todayLocal = createLocalDate(todayString);
      const eventLocal = createLocalDate(eventDateString);

      const diffTime = eventLocal.getTime() - todayLocal.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    [getLocalDateString, createLocalDate],
  );
  const remainingDays = getRemainingDays(item?.date ?? "");
  const isPast = remainingDays < 0;

  const handleEdit = useCallback(() => {
    onEdit?.(item);
  }, [onEdit, item]);

  const handleDelete = useCallback(() => {
    onDelete?.(item._id);
  }, [onDelete, item._id]);

  const rightAction = () => (
    <Pressable onPress={handleDelete} style={{ width: 80 }}>
      <Row
        justifyContent="center"
        alignItems="center"
        style={commonStyles.fullFlex}
      >
        <Ionicons name="trash" size={30} color={"red"} />
      </Row>
    </Pressable>
  );

  const leftAction = () => {
    return (
      <Pressable onPress={handleEdit} style={{ width: 80 }}>
        <Row
          justifyContent="center"
          alignItems="center"
          style={commonStyles.fullFlex}
        >
          <Ionicons name={"create-outline"} size={30} color={themeColor.dark} />
        </Row>
      </Pressable>
    );
  };

  return (
    <Swiper rightAction={rightAction} leftAction={leftAction}>
      <TouchableOpacity
        // onPress={() =>
        //   navigation.navigate(ROUTES.TASK_DETAIL, { taskId: item._id })
        // }
        disabled
      >
        <CardWrapper
          style={[
            commonStyles.cardContainer,
            {
              padding: 0,
              backgroundColor: theme.colors.background,
              ...containerStyle,
            },
          ]}
          // image={item?.image}
        >
          <Row alignItems="center">
            {item?.image && (
              <Image
                source={{ uri: item.image }}
                style={{
                  height: "100%",
                  width: 120,
                  backgroundColor: theme.colors.loaderBg,
                }}
              />
            )}
            <Column
              gap={6}
              justifyContent="space-evenly"
              style={[
                commonStyles.fullFlex,
                { paddingHorizontal: 12, paddingVertical: 6 },
              ]}
            >
              <Row justifyContent="space-between" alignItems="center">
                <Text
                  style={[commonStyles.basicText, commonStyles.fullFlex]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Spacer size={20} position="right" />
                <Row alignItems="center" gap={4}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={theme.colors.textLight}
                  />
                  <Text style={commonStyles.tTinyText}>
                    {formatDate(item.date, "date")}
                  </Text>
                </Row>
              </Row>
              <Text numberOfLines={2} style={commonStyles.tinyText}>
                {item.description || "📝 No Description"}
              </Text>
              <Row justifyContent="space-between" alignItems="center">
                <Row alignItems="center">
                  <Text style={commonStyles.tTinyText}>Creator: </Text>
                  <Avatar
                    name={item?.createdByDetails?.name ?? ""}
                    image={item?.createdByDetails?.image}
                    withName
                  />
                </Row>
                <Text
                  style={[
                    commonStyles.smallText,
                    {
                      color: isPast
                        ? theme.colors.textLight
                        : themeColor?.dark || theme.colors.primary,
                    },
                  ]}
                >
                  {isPast
                    ? `${Math.abs(remainingDays)} days ago`
                    : remainingDays === 0
                      ? "Today"
                      : remainingDays === 1
                        ? "Tomorrow"
                        : `${remainingDays} days left`}
                </Text>
              </Row>
            </Column>
          </Row>
        </CardWrapper>
      </TouchableOpacity>
    </Swiper>
  );
};

export default EventCard;
