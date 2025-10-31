import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useReelsViewModal } from "./useViewModal";
import { IVideo } from "../../types/videos";
import { useHelper } from "../../utils/helper";
import VideoItem from "../../components/VideoItem";
import EmptyState from "../../components/emptyState";
import { Spacer } from "../../tools";
import { useTheme } from "../../infrastructure/theme";
import { LoaderTypes } from "../../components/screenLoader";

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
  const theme = useTheme();
  const styles = reelsScreenStyles(theme);
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
        // Only update currentIndex when the visible item changes
        const newIndex = viewableItems[0].index ?? 0;
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      }
    },
    [currentIndex, setCurrentIndex]
  );

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      // Append new videos without resetting FlatList or currentIndex
      fetchVideos(currentPage + 1, true);
    }
  };

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

  // Cleanup all refs when component unmounts
  useEffect(() => {
    return () => {
      Object.keys(videoRefs.current).forEach((key) => {
        videoRefs.current[key] = null;
      });
    };
  }, []);

  if (error || loading || videos.length === 0) {
    return (
      <SafeAreaView style={[styles.container]}>
        <Spacer size={insets.top} />
        <EmptyState
          text={"No videos found"}
          loading={loading}
          error={error?.trim()?.length > 0 && false}
          button={() => fetchVideos(1, false)}
          type={LoaderTypes.VideoScreen}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
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
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      />
    </SafeAreaView>
  );
}

const reelsScreenStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
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
