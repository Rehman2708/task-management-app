import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";
import { Column, dimensions, isDarkMode, Row, Spacer } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";

const { width } = Dimensions.get("window");

export enum LoaderTypes {
  ImageModal = "ImageModal",
  Comment = "Comment",
  NotificationScreen = "notificationScreen",
  TaskScreen = "taskScreen",
  NotesScreen = "notesScreen",
  ListScreen = "listScreen",
  TaskDetailScreen = "taskDetailScreen",
  ListDetailScreen = "listDetailScreen",
  NotesDetailScreen = "notesDetailScreen",
  VideoScreen = "VideoScreen",
}

interface ScreenLoaderProps {
  type?: LoaderTypes | string;
  count?: number;
}

const ScreenLoader: React.FC<ScreenLoaderProps> = ({ type, count }) => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = screenLoaderStyles(theme);
  const commonStyles = useCommonStyles(theme);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const highlightColor = themeColor?.dark ?? theme.colors.primary;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = useMemo(
    () =>
      shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
      }),
    [shimmerAnim]
  );

  const ShimmerBlock = React.memo(
    ({
      height,
      width,
      radius = 16,
      style,
    }: {
      height: number | string;
      width: number | string;
      radius?: number;
      style?: ViewStyle;
    }) => (
      <View
        style={[
          styles.block,
          {
            height,
            width,
            borderRadius: radius,
            backgroundColor: theme.colors.loaderBg,
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
              backgroundColor: highlightColor,
              opacity: 0.2,
            },
          ]}
        />
      </View>
    )
  );

  /** Helper to render multiple shimmer lines */
  const renderLines = (
    count: number,
    widthOptions: (string | number)[] = [],
    height?: number
  ) =>
    Array.from({ length: count }, (_, i) => (
      <ShimmerBlock
        key={i}
        height={height ?? 12}
        width={widthOptions[i % widthOptions.length] ?? "100%"}
        style={{ marginBottom: i < count - 1 ? 8 : 0 }}
      />
    ));

  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const renderImageModalLoader = () => (
    <FlatList
      data={Array.from({ length: 9 })}
      renderItem={({ item }) => (
        <ShimmerBlock
          height={100}
          width={100}
          radius={12}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            margin: 4,
          }}
        />
      )}
      showsVerticalScrollIndicator={false}
      keyExtractor={(_, index) => index.toString()}
      numColumns={3}
      contentContainerStyle={{
        marginTop: 16,
        paddingBottom: 30,
      }}
      columnWrapperStyle={{
        justifyContent: "center",
      }}
    />
  );

  const renderCommentLoader = () => (
    <Column gap={8} style={{ paddingHorizontal: 12, flex: 1 }}>
      {Array.from({ length: 15 }).map((_, i) => {
        const isRight = Math.random() > 0.5;
        const bubbleWidth = getRandomInt(80, 250);
        const bubbleHeight = getRandomInt(18, 40);
        const avatarSize = 30;

        return (
          <Row
            key={i}
            alignItems="flex-start"
            justifyContent={isRight ? "flex-end" : "flex-start"}
            gap={8}
          >
            {!isRight && (
              <ShimmerBlock
                height={avatarSize}
                width={avatarSize}
                radius={50}
              />
            )}
            <ShimmerBlock
              height={bubbleHeight}
              width={bubbleWidth}
              radius={10}
            />
            {isRight && (
              <ShimmerBlock
                height={avatarSize}
                width={avatarSize}
                radius={50}
              />
            )}
          </Row>
        );
      })}
    </Column>
  );

  /** VIDEO SCREEN */
  const renderVideoLoader = () => (
    <View style={{ flex: 1, padding: 12 }}>
      {renderLines(1, ["50%"], 20)}
      <View style={{ flex: 1 }} />
      <Row alignItems="flex-end" justifyContent="space-between">
        <Row alignItems="center" gap={12}>
          <ShimmerBlock height={50} width={50} radius={100} />
          <View>{renderLines(2, [150, 100])}</View>
        </Row>
        <Column alignItems="center" gap={16}>
          <ShimmerBlock height={40} width={40} radius={100} />
          <ShimmerBlock height={40} width={40} radius={100} />
          <ShimmerBlock height={40} width={40} radius={100} />
          <ShimmerBlock height={40} width={40} radius={100} />
        </Column>
      </Row>
    </View>
  );

  /** NOTIFICATION SCREEN */
  const renderNotificationLoader = () => (
    <FlatList
      data={Array.from({ length: count ?? 12 })}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <Row
          alignItems="center"
          style={[
            {
              backgroundColor: "transparent",
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: dimensions.width + 32,
              marginLeft: -16,
            },
          ]}
        >
          {index % getRandomInt(2, 4) ? (
            <>
              <ShimmerBlock height={60} width={60} radius={100} />
            </>
          ) : (
            <></>
          )}
          <Spacer position="right" size={12} />
          <View style={styles.taskTextContainer}>
            {renderLines(getRandomInt(2, 4), ["100%", "40%", "80%", "100%"])}
          </View>
        </Row>
      )}
    />
  );

  /** TASK SCREEN */
  const renderTaskLoader = () => (
    <FlatList
      data={Array.from({ length: count ?? 8 })}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => (
        <Row
          alignItems="center"
          style={[styles.taskCard, { padding: 0, height: 110 }]}
        >
          {index % getRandomInt(0, 5) ? (
            <ShimmerBlock height={"100%"} width={120} radius={0} />
          ) : (
            <></>
          )}
          <Spacer position="right" size={12} />
          <View style={styles.taskTextContainer}>
            {renderLines(5, ["60%", "95%", "40%", "80%", "95%"])}
          </View>
        </Row>
      )}
    />
  );

  /** NOTES SCREEN (grid) or LIST SCREEN (list) */
  const renderNotesLoader = (isList = false) => (
    <View
      style={[styles.gridContainer, isList && { justifyContent: "flex-start" }]}
    >
      {Array.from({ length: count ?? 10 }).map((_, i) => (
        <View key={i} style={[styles.notesCard, isList && { width: "100%" }]}>
          <ShimmerBlock height={80} width="100%" radius={0} />
          <View style={styles.notesContent}>
            {renderLines(isList ? 4 : 6, [
              `${getRandomInt(80, 100)}%`,
              `${getRandomInt(50, 100)}%`,
              `${getRandomInt(20, 100)}%`,
              `${getRandomInt(10, 100)}%`,
              `${getRandomInt(40, 100)}%`,
            ])}
          </View>
        </View>
      ))}
    </View>
  );

  /** TASK DETAIL SCREEN */
  const renderTaskDetailLoader = () => (
    <View style={{ marginTop: 10 }}>
      {renderLines(2, ["100%", "50%"])}
      <View style={styles.spacer} />
      {renderLines(3, ["100%", "70%", "100%"])}
      <View
        style={[styles.separator, { backgroundColor: theme.colors.border }]}
      />
      <ShimmerBlock height={16} width="40%" style={{ marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Row
          alignItems="center"
          style={[
            styles.taskCard,
            {
              backgroundColor:
                i > getRandomInt(0, 4)
                  ? `${theme.colors.success}20`
                  : `${theme.colors.error}20`,
            },
          ]}
          key={i}
        >
          <View style={{ flex: 1 }}>
            {renderLines(3, ["100%", "40%", "80%"])}
          </View>
        </Row>
      ))}
    </View>
  );

  /** NOTES DETAIL or LIST DETAIL SCREEN */
  const renderNoteDetailLoader = (isList = false) => (
    <View style={{ marginTop: 10 }}>
      {renderLines(2, ["100%", "50%"])}
      <View style={{ marginVertical: 20 }}>
        {renderLines(isList ? 4 : 30, ["100%", "80%", "60%", "90%"])}
      </View>

      {isList &&
        Array.from({ length: 4 }).map((_, i) => (
          <Row
            alignItems="center"
            style={[
              styles.taskCard,
              isList && {
                backgroundColor:
                  i > getRandomInt(0, 3)
                    ? `${theme.colors.success}20`
                    : `${theme.colors.error}20`,
              },
            ]}
            key={i}
          >
            <View style={{ flex: 1 }}>
              {renderLines(2, ["100%", "80%", "60%"])}
            </View>
          </Row>
        ))}
    </View>
  );

  const renderLoader = () => {
    switch (type) {
      case LoaderTypes.ImageModal:
        return renderImageModalLoader();
      case LoaderTypes.Comment:
        return renderCommentLoader();
      case LoaderTypes.VideoScreen:
        return renderVideoLoader();
      case LoaderTypes.NotificationScreen:
        return renderNotificationLoader();
      case LoaderTypes.TaskScreen:
        return renderTaskLoader();
      case LoaderTypes.NotesScreen:
        return renderNotesLoader();
      case LoaderTypes.ListScreen:
        return renderNotesLoader(true);
      case LoaderTypes.TaskDetailScreen:
        return renderTaskDetailLoader();
      case LoaderTypes.NotesDetailScreen:
        return renderNoteDetailLoader();
      case LoaderTypes.ListDetailScreen:
        return renderNoteDetailLoader(true);
      default:
        return (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={themeColor?.dark ?? theme.colors.primary}
            />
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderLoader()}</View>;
};

const screenLoaderStyles = (theme: any) => {
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    block: {
      overflow: "hidden",
    },
    listContainer: {
      alignItems: "center",
      paddingBottom: 20,
    },
    taskCard: {
      ...commonStyles.cardContainer,

      backgroundColor: "#ffffff0d",
      width: "100%",
    },
    taskTextContainer: {
      flex: 1,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      paddingBottom: 30,
    },
    notesCard: {
      ...commonStyles.cardContainer,
      backgroundColor: "#ffffff0d",
      width: "48%",
      padding: 0,
    },
    notesContent: {
      padding: 8,
    },
    separator: {
      height: 1,
      marginVertical: 20,
    },
    spacer: {
      height: 20,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
export default React.memo(ScreenLoader);
