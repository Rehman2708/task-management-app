import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
  View,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { IVideo } from "../../types/videos";
import VideoItem from "../../components/VideoItem";
import EmptyState from "../../components/emptyState";
import { Spacer } from "../../tools";
import { LoaderTypes } from "../../components/screenLoader";
import { useUtilStore } from "../../store/utils";
import { useHelper } from "../../utils/helper";
import { useReelsViewModal } from "./useViewModal";

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

  const { themeColor } = useHelper();
  const { fetchingReels } = useUtilStore();
  const flatListRef = useRef<FlatList<IVideo>>(null);
  const isFocused = useIsFocused();
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchVideos(1, false);
  }, [fetchVideos, fetchingReels]);

  // Scroll to current index on focus
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

  // Hide muted icon after 2s
  useEffect(() => {
    if (!mutedIcon) return;
    const timer = setTimeout(() => setMutedIcon(false), 2000);
    return () => clearTimeout(timer);
  }, [mutedIcon, setMutedIcon]);

  // Update currentIndex when visible items change
  const onViewRef = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (!isFocused || viewableItems.length === 0) return;

      const visibleItem = viewableItems.find((item) => item.isViewable);
      if (!visibleItem) return;

      const newIndex = visibleItem.index ?? 0;
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    },
    [currentIndex, setCurrentIndex, isFocused]
  );

  const viewConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 80 }),
    []
  );

  // Load more videos when reaching end
  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      fetchVideos(currentPage + 1, true);
    }
  };

  // Render each video item
  const renderItem: ListRenderItem<IVideo> = useCallback(
    ({ item, index }) => {
      // Preload videos one before and after current index
      const preload =
        index >= currentIndex - 1 &&
        index <= currentIndex + 1 &&
        index !== currentIndex;

      return (
        <VideoItem
          item={item}
          index={index}
          currentIndex={currentIndex}
          isFocused={isFocused} // Respect tab focus
          muted={muted}
          mutedIcon={mutedIcon}
          windowHeight={windowHeight}
          longPressedIndex={longPressedIndex}
          setMuted={setMuted}
          setMutedIcon={setMutedIcon}
          setLongPressedIndex={setLongPressedIndex}
          deleteVideo={deleteVideo}
          showDelete
          preload={preload}
        />
      );
    },
    [
      currentIndex,
      isFocused,
      muted,
      mutedIcon,
      windowHeight,
      longPressedIndex,
      setMuted,
      setMutedIcon,
      setLongPressedIndex,
      deleteVideo,
    ]
  );

  // Show empty state if no videos
  if (error || loading || videos.length === 0) {
    return (
      <SafeAreaView style={[styles.container]}>
        <Spacer size={insets.top} />
        <EmptyState
          text={"No videos"}
          loading={loading}
          error={error?.trim()?.length > 0 && false}
          button={() => fetchVideos(1, false)}
          type={LoaderTypes.VideoScreen}
        />
        <Spacer size={100} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item._id + item.createdAt}
        renderItem={renderItem}
        snapToInterval={windowHeight} // Snap to each video
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3} // Preload surrounding videos
        removeClippedSubviews={true} // Free memory for offscreen videos
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        getItemLayout={(_, index) => ({
          length: windowHeight,
          offset: windowHeight * index,
          index,
        })}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" color={themeColor.dark} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor.dark]}
          />
        }
        updateCellsBatchingPeriod={50}
      />
      <Spacer size={80} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e0e" },
});
