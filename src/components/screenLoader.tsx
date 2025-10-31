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
import { isDarkMode } from "../tools";

const { width } = Dimensions.get("window");

export enum LoaderTypes {
  NotificationScreen = "notificationScreen",
  TaskScreen = "taskScreen",
  NotesScreen = "notesScreen",
  ListScreen = "listScreen",
  TaskDetailScreen = "taskDetailScreen",
  ListDetailScreen = "listDetailScreen",
  NotesDetailScreen = "notesDetailScreen",
}

interface ScreenLoaderProps {
  type?: LoaderTypes | string;
}

const ScreenLoader: React.FC<ScreenLoaderProps> = ({ type }) => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const baseColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const highlightColor = themeColor?.dark ?? theme.colors.primary;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
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
          { height, width, borderRadius: radius, backgroundColor: baseColor },
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
  const renderLines = (count: number, widthOptions: (string | number)[] = []) =>
    Array.from({ length: count }, (_, i) => (
      <ShimmerBlock
        key={i}
        height={12}
        width={widthOptions[i % widthOptions.length] ?? "100%"}
        style={{ marginBottom: 8 }}
      />
    ));

  /** NOTIFICATION SCREEN */
  const renderNotificationLoader = () => (
    <FlatList
      data={Array.from({ length: 12 })}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={() => (
        <View
          style={[
            styles.taskCard,

            {
              marginBottom: 6,
              backgroundColor: "transparent",
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ShimmerBlock height={60} width={60} radius={100} />
          <View style={styles.taskTextContainer}>
            {renderLines(3, ["100%", "40%", "80%"])}
          </View>
        </View>
      )}
    />
  );

  /** TASK SCREEN */
  const renderTaskLoader = () => (
    <FlatList
      data={Array.from({ length: 8 })}
      keyExtractor={(_, i) => i.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={() => (
        <View style={styles.taskCard}>
          <ShimmerBlock height={70} width={70} radius={12} />
          <View style={styles.taskTextContainer}>
            {renderLines(3, ["60%", "40%", "80%"])}
          </View>
        </View>
      )}
    />
  );

  /** NOTES SCREEN (grid) or LIST SCREEN (list) */
  const renderNotesLoader = (isList = false) => (
    <View
      style={[styles.gridContainer, isList && { justifyContent: "flex-start" }]}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={[styles.notesCard, isList && { width: "100%" }]}>
          <ShimmerBlock height={90} width="100%" radius={0} />
          <View style={styles.notesContent}>
            {renderLines(5, ["100%", "100%", "70%", "50%", "50%"])}
          </View>
        </View>
      ))}
    </View>
  );

  /** TASK DETAIL SCREEN */
  const renderTaskDetailLoader = () => (
    <View>
      {renderLines(2, ["100%", "50%"])}
      <View style={styles.spacer} />
      {renderLines(3, ["100%", "70%", "100%"])}
      <View
        style={[styles.separator, { backgroundColor: theme.colors.border }]}
      />
      <ShimmerBlock height={16} width="40%" style={{ marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <View style={styles.taskCard} key={i}>
          <View style={{ flex: 1 }}>
            {renderLines(3, ["100%", "40%", "80%"])}
          </View>
        </View>
      ))}
    </View>
  );

  /** NOTES DETAIL or LIST DETAIL SCREEN */
  const renderNoteDetailLoader = (isList = false) => (
    <View>
      {renderLines(2, ["100%", "50%"])}
      <View style={{ marginVertical: 20 }}>
        {renderLines(isList ? 4 : 30, ["100%", "80%", "60%", "90%"])}
      </View>

      {isList &&
        Array.from({ length: 4 }).map((_, i) => (
          <View style={styles.taskCard} key={i}>
            <View style={{ flex: 1 }}>
              {renderLines(3, ["100%", "80%", "60%"])}
            </View>
          </View>
        ))}
    </View>
  );

  const renderLoader = () => {
    switch (type) {
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

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 30,
  },
  notesCard: {
    width: "46%",
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
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

export default React.memo(ScreenLoader);
