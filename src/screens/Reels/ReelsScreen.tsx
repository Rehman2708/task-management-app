import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  ListRenderItem,
} from "react-native";
import Video from "react-native-video";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../../infrastructure/theme";
import { useReelsViewModal } from "./useViewModal";
import { Column } from "../../tools";
import { commonStyles } from "../../styles/commonstyles";
import { IVideo } from "../../types/videos";

export default function ReelsScreen() {
  const {
    insets,
    fetchVideos,
    videos,
    loading,
    setCurrentIndex,
    currentIndex,
    muted,
    windowHeight,
    error,
    setMuted,
    mutedIcon,
    setMutedIcon,
  } = useReelsViewModal();

  const flatListRef = useRef<FlatList<IVideo>>(null);
  const isFocused = useIsFocused();
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Resume from last index when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (currentIndex >= 0) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex,
          animated: false,
        });
      }
    }, [currentIndex])
  );

  // Auto-hide mute icon after 2s
  useEffect(() => {
    if (!mutedIcon) return;
    const timer = setTimeout(() => setMutedIcon(false), 2000);
    return () => clearTimeout(timer);
  }, [mutedIcon, setMutedIcon]);

  // Track visible item
  const onViewRef = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    [setCurrentIndex]
  );

  const viewConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 80 }),
    []
  );

  const renderItem: ListRenderItem<IVideo> = useCallback(
    ({ item, index }) => (
      <View style={[styles.videoContainer, { height: windowHeight }]}>
        <Video
          source={{ uri: item.url }}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted={muted}
          controls={false}
          paused={
            index !== currentIndex || !isFocused || longPressedIndex === index
          }
        />
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setMuted((m) => !m);
            setMutedIcon(true);
          }}
          onLongPress={() => setLongPressedIndex(index)}
          onPressOut={() => setLongPressedIndex(null)}
        >
          <Column
            style={commonStyles.fullFlex}
            justifyContent="center"
            alignItems="center"
          >
            {mutedIcon && (
              <Ionicons
                name={muted ? "volume-mute-outline" : "volume-high-outline"}
                size={70}
                color={theme.colors.border}
              />
            )}
          </Column>
        </Pressable>
      </View>
    ),
    [
      windowHeight,
      muted,
      mutedIcon,
      currentIndex,
      isFocused,
      longPressedIndex,
      setMuted,
      setMutedIcon,
    ]
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.loaderOverlay}>
          <Pressable onPress={fetchVideos}>
            <Text style={commonStyles.errorText}>
              Failed to load videos. Tap to retry.
            </Text>
            <ActivityIndicator size="large" color="red" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        snapToInterval={windowHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        windowSize={3}
        removeClippedSubviews
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  videoContainer: {
    width: "100%",
    backgroundColor: "black",
  },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
