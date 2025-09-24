import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  ListRenderItem,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useReelsViewModal } from "./useViewModal";
import { commonStyles } from "../../styles/commonstyles";
import { IVideo } from "../../types/videos";
import { useHelper } from "../../utils/helper";
import VideoItem from "../../components/VideoItem";

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
    currentPage,
    totalPages,
    isFetchingMore,
    deleteVideo,
    refreshing,
    onRefresh,
  } = useReelsViewModal();
  const { formatDate } = useHelper();
  const flatListRef = useRef<FlatList<IVideo>>(null);
  const isFocused = useIsFocused();
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<string, IVideo | null>>({});

  useEffect(() => {
    fetchVideos(1, false); // initial load
  }, [fetchVideos]);

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

  useEffect(() => {
    if (!mutedIcon) return;
    const timer = setTimeout(() => setMutedIcon(false), 2000);
    return () => clearTimeout(timer);
  }, [mutedIcon, setMutedIcon]);

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
      <VideoItem
        item={item}
        index={index}
        currentIndex={currentIndex}
        isFocused={isFocused}
        muted={muted}
        mutedIcon={mutedIcon}
        windowHeight={windowHeight}
        longPressedIndex={longPressedIndex}
        setMuted={setMuted}
        setMutedIcon={setMutedIcon}
        setLongPressedIndex={setLongPressedIndex}
        deleteVideo={deleteVideo}
        showDelete
      />
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
      setLongPressedIndex,
      deleteVideo,
    ]
  );

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      fetchVideos(currentPage + 1, true);
    }
  };

  // Cleanup all refs when component unmounts
  useEffect(() => {
    return () => {
      Object.keys(videoRefs.current).forEach((key) => {
        videoRefs.current[key] = null;
      });
    };
  }, []);

  if (loading && videos.length === 0) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.loaderOverlay}>
          <Pressable onPress={() => fetchVideos(1, false)}>
            <Text style={commonStyles.errorText}>
              Failed to load videos. Tap to retry.
            </Text>
            <ActivityIndicator size="large" color="#fff" />
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
        keyExtractor={(item) => item._id.toString() + item.createdAt}
        renderItem={renderItem}
        snapToInterval={windowHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        windowSize={5}
        removeClippedSubviews
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        getItemLayout={(_, index) => ({
          length: windowHeight,
          offset: windowHeight * index,
          index,
        })}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoContainer: {
    width: "100%",
  },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
