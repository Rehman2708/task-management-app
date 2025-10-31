import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";
import { isDarkMode } from "../tools";

const { width } = Dimensions.get("window");

export enum LoaderTypes {
  TaskScreen = "taskScreen",
  NotesScreen = "notesScreen",
  ListScreen = "listScreen",
  TaskDetailScreen = "taskDetailScreen",
  ListDetailScreen = "listDetailScreen",
  NotesDetailScreen = "notesDetailScreen",
}
type LoaderType = keyof typeof LoaderTypes;

interface ScreenLoaderProps {
  type?: LoaderType | string;
}

const ScreenLoader: React.FC<ScreenLoaderProps> = ({ type }) => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const baseColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const highlightColor = themeColor?.dark ?? theme.colors.primary;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const ShimmerBlock = ({
    height,
    width,
    radius = 10,
    style,
  }: {
    height: number | string;
    width: number | string;
    radius?: number;
    style?: any;
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
  );

  const renderTaskLoader = () => (
    <FlatList
      data={[1, 2, 3, 4, 5, 6, 7, 8]}
      keyExtractor={(i) => i.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={() => (
        <View style={styles.taskCard}>
          <ShimmerBlock height={70} width={70} radius={12} />
          <View style={styles.taskTextContainer}>
            <ShimmerBlock
              height={15}
              width="60%"
              style={{ marginBottom: 10 }}
            />
            <ShimmerBlock height={10} width="40%" style={{ marginBottom: 8 }} />
            <ShimmerBlock height={10} width="80%" />
          </View>
        </View>
      )}
    />
  );

  const renderThoughtLoader = (list?: boolean) => (
    <View style={styles.gridContainer}>
      {[...Array(10)].map((_, i) => (
        <View key={i} style={[styles.notesCard, list && { width: "100%" }]}>
          <ShimmerBlock height={90} width="100%" radius={0} />
          <View style={{ padding: 8 }}>
            <ShimmerBlock
              height={12}
              width="100%"
              style={{ marginBottom: 8 }}
            />
            <ShimmerBlock
              height={12}
              width="100%"
              style={{ marginBottom: 8 }}
            />
            <ShimmerBlock height={12} width="70%" style={{ marginBottom: 8 }} />
            <ShimmerBlock height={10} width="50%" style={{ marginBottom: 8 }} />
            <ShimmerBlock height={10} width="50%" />
          </View>
        </View>
      ))}
    </View>
  );

  if (!type) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={themeColor?.dark ?? theme.colors.primary}
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {type === "taskScreen" && renderTaskLoader()}
      {type === "notesScreen" && renderThoughtLoader()}
      {type === "listScreen" && renderThoughtLoader(true)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  block: {
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },

  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    width: "100%",
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingBottom: 30,
    paddingTop: 10,
  },
  notesCard: {
    width: "46%",
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  listContainer: {
    alignItems: "center",
  },
});

export default ScreenLoader;
