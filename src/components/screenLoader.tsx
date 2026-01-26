import React, { useEffect, useRef, useMemo, useCallback } from "react";
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
  NotesDetailScreen = "notesdetail",
  VideoScreen = "VideoScreen",
  ProfileScreen = "profileScreen",
  CalendarScreen = "calendarScreen",
}

interface ScreenLoaderProps {
  type?: LoaderTypes | string;
  count?: number;
}

/**
 * Enhanced ScreenLoader
 * - Improved shimmer using translate + rotation
 * - Each ShimmerBlock pulses with a subtle scale animation with per-block random delay
 * - Entrance fade for blocks to reduce pop-in
 * - Memoized renderers and callbacks to avoid unnecessary re-renders
 */
const ScreenLoader: React.FC<ScreenLoaderProps> = ({ type, count }) => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = screenLoaderStyles(theme);
  const commonStyles = useCommonStyles(theme);

  // global shimmer animation shared among blocks
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const highlightColor = themeColor?.dark ?? theme.colors.primary;

  useEffect(() => {
    // continuous shimmer (translate)
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 1.2, width * 1.2],
  });

  // ShimmerBlock: self-contained animated skeleton block
  const ShimmerBlock = React.memo(
    ({
      height,
      width,
      radius = 16,
      style,
      index = 0,
    }: {
      height: number | string;
      width: number | string;
      radius?: number;
      style?: ViewStyle;
      index?: number;
    }) => {
      // subtle pulse animation per block
      const pulse = useRef(new Animated.Value(0)).current; // 0 -> 1
      const fade = useRef(new Animated.Value(0)).current; // entrance fade

      useEffect(() => {
        // small randomized delay so blocks don't pulse in perfect sync
        const delay = Math.min(600, (index % 10) * 60 + Math.random() * 120);

        // entrance fade
        Animated.timing(fade, {
          toValue: 1,
          duration: 300,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        // ongoing pulse (scale)
        const pulseAnim = Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 800 + Math.random() * 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 800 + Math.random() * 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        );
        const timeout = setTimeout(() => pulseAnim.start(), delay);
        return () => {
          clearTimeout(timeout);
          pulseAnim.stop();
        };
      }, [fade, index, pulse]);

      const scale = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.995, 1.01],
      });

      return (
        <Animated.View
          style={[
            styles.block,
            {
              height: height as any,
              width: width as any,
              borderRadius: radius,
              backgroundColor: theme.colors.loaderBg,
              overflow: "hidden",
              transform: [{ scale }],
              opacity: fade,
            },
            style,
          ]}
        >
          {/* diagonal shimmer overlay - uses the shared translateX so it's in sync */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateX },
                  { rotate: "12deg" },
                  { translateY: -10 },
                ],
                backgroundColor: highlightColor,
                opacity: 0.12,
                width: width === "100%" ? width : undefined,
              },
            ]}
            pointerEvents="none"
          />
        </Animated.View>
      );
    },
  );

  /** Helper to render multiple shimmer lines (memoized to avoid recreation) */
  const renderLines = useCallback(
    (count: number, widthOptions: (string | number)[] = [], height?: number) =>
      Array.from({ length: count }, (_, i) => (
        <ShimmerBlock
          key={i}
          index={i}
          height={height ?? 12}
          width={widthOptions[i % widthOptions.length] ?? "100%"}
          style={{ marginBottom: i < count - 1 ? 8 : 0 }}
        />
      )),
    [], // ShimmerBlock is stable via memo
  );

  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Individual renderers (memoized)
  const renderImageModalLoader = useCallback(
    () => (
      <FlatList
        data={Array.from({ length: 9 })}
        renderItem={({ item, index }) => (
          <ShimmerBlock
            index={index}
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
    ),
    [ShimmerBlock, theme.colors.border],
  );

  const renderCommentLoader = useCallback(
    () => (
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
                  index={i}
                  height={avatarSize}
                  width={avatarSize}
                  radius={50}
                />
              )}
              <ShimmerBlock
                index={i}
                height={bubbleHeight}
                width={bubbleWidth}
                radius={10}
              />
              {isRight && (
                <ShimmerBlock
                  index={i}
                  height={avatarSize}
                  width={avatarSize}
                  radius={50}
                />
              )}
            </Row>
          );
        })}
      </Column>
    ),
    [ShimmerBlock],
  );

  const renderVideoLoader = useCallback(
    () => (
      <View style={{ flex: 1, padding: 12 }}>
        {renderLines(1, ["50%"], 20)}
        <View style={{ flex: 1 }} />
        <Row alignItems="flex-end" justifyContent="space-between">
          <Row alignItems="center" gap={12}>
            <ShimmerBlock index={0} height={50} width={50} radius={100} />
            <View>{renderLines(2, [150, 100])}</View>
          </Row>
          <Column alignItems="center" gap={16}>
            <ShimmerBlock index={1} height={40} width={40} radius={100} />
            <ShimmerBlock index={2} height={40} width={40} radius={100} />
            <ShimmerBlock index={3} height={40} width={40} radius={100} />
            <ShimmerBlock index={4} height={40} width={40} radius={100} />
          </Column>
        </Row>
      </View>
    ),
    [renderLines, ShimmerBlock],
  );

  const renderNotificationLoader = useCallback(
    () => (
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
              <ShimmerBlock index={index} height={60} width={60} radius={100} />
            ) : null}
            <Spacer position="right" size={12} />
            <View style={styles.taskTextContainer}>
              {renderLines(getRandomInt(2, 4), ["100%", "40%", "80%", "100%"])}
            </View>
          </Row>
        )}
      />
    ),
    [count, renderLines, ShimmerBlock, theme.colors.border],
  );

  const renderTaskLoader = useCallback(
    (isEvent: boolean) => (
      <FlatList
        data={Array.from({ length: count ?? 8 })}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isEvent}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <Row
            alignItems="center"
            style={[
              styles.taskCard,
              { padding: 0, height: isEvent ? 80 : 110 },
            ]}
          >
            {index % getRandomInt(0, 5) ? (
              <ShimmerBlock
                index={index}
                height="100%"
                width={120}
                radius={0}
              />
            ) : null}
            <Spacer position="right" size={12} />
            <View style={styles.taskTextContainer}>
              {renderLines(isEvent ? 3 : 5, [
                "60%",
                "95%",
                "40%",
                "80%",
                "95%",
              ])}
            </View>
          </Row>
        )}
      />
    ),
    [count, renderLines, ShimmerBlock],
  );

  const renderNotesLoader = useCallback(
    (isList = false) => (
      <View
        style={[
          styles.gridContainer,
          isList && { justifyContent: "flex-start" },
        ]}
      >
        {Array.from({ length: count ?? 10 }).map((_, i) => (
          <View key={i} style={[styles.notesCard, isList && { width: "100%" }]}>
            <ShimmerBlock index={i} height={80} width="100%" radius={0} />
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
    ),
    [count, renderLines, ShimmerBlock],
  );

  const renderTaskDetailLoader = useCallback(
    () => (
      <View style={{ marginTop: 10 }}>
        {renderLines(2, ["100%", "50%"])}
        <View style={styles.spacer} />
        {renderLines(3, ["100%", "70%", "100%"])}
        <View
          style={[styles.separator, { backgroundColor: theme.colors.border }]}
        />
        <ShimmerBlock
          index={0}
          height={16}
          width="40%"
          style={{ marginBottom: 16 }}
        />
        {Array.from({ length: 10 }).map((_, i) => (
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
    ),
    [renderLines, ShimmerBlock, theme.colors.border],
  );

  const renderNoteDetailLoader = useCallback(
    (isList = false) => (
      <View style={{ marginTop: 10 }}>
        {renderLines(2, ["100%", "50%"])}
        <View style={{ marginVertical: 20 }}>
          {renderLines(isList ? 6 : 30, ["100%", "80%", "60%", "90%"])}
        </View>

        {isList &&
          Array.from({ length: 10 }).map((_, i) => (
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
    ),
    [renderLines, ShimmerBlock],
  );

  const renderProfileLoader = useCallback(
    () => (
      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        {/* Profile images section */}
        <Row
          justifyContent="center"
          alignItems="center"
          gap={8}
          style={{ marginBottom: 30 }}
        >
          <ShimmerBlock index={0} height={140} width={140} radius={70} />
          <ShimmerBlock index={1} height={40} width={40} radius={20} />
          <ShimmerBlock index={2} height={140} width={140} radius={70} />
        </Row>

        {/* Profile info lines */}
        <Column gap={8} style={{ marginBottom: 30 }}>
          {renderLines(6, ["60%", "80%", "70%", "100%", "90%"], 16)}
        </Column>

        {/* Partner section or add partner input */}
        <Column gap={12} style={{ marginBottom: 40 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerBlock
              key={i}
              index={5}
              height={45}
              width="100%"
              radius={8}
            />
          ))}
        </Column>
      </View>
    ),
    [renderLines, ShimmerBlock, theme.colors.primary],
  );

  const renderLoader = useMemo(() => {
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
        return renderTaskLoader(false);
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
      case LoaderTypes.ProfileScreen:
        return renderProfileLoader();
      case LoaderTypes.CalendarScreen:
        return renderTaskLoader(true);
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
  }, [
    type,
    renderImageModalLoader,
    renderCommentLoader,
    renderVideoLoader,
    renderNotificationLoader,
    renderTaskLoader,
    renderNotesLoader,
    renderTaskDetailLoader,
    renderNoteDetailLoader,
    renderProfileLoader,
    styles.center,
    themeColor,
    theme.colors.primary,
  ]);

  return <View style={styles.container}>{renderLoader}</View>;
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
