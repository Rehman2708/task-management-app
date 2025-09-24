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
import { Column, Row } from "../../tools";
import { commonStyles } from "../../styles/commonstyles";
import { IVideo } from "../../types/videos";
import Avatar from "../../components/avatar";
import { useHelper } from "../../utils/helper";

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
  } = useReelsViewModal();
  const { formatDate } = useHelper();
  const flatListRef = useRef<FlatList<IVideo>>(null);
  const isFocused = useIsFocused();
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

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
          <Row alignItems="center" gap={8} style={{ padding: 12 }}>
            <Column gap={2}>
              <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
                {item.title}
              </Text>
            </Column>
          </Row>
          <Column
            style={commonStyles.fullFlex}
            justifyContent="center"
            alignItems="center"
          >
            {mutedIcon && (
              <Ionicons
                name={muted ? "volume-mute-outline" : "volume-high-outline"}
                size={50}
                color={"#fff"}
              />
            )}
          </Column>
          <Row
            justifyContent="space-between"
            alignItems="center"
            style={{ padding: 12 }}
          >
            <Row alignItems="center" gap={8}>
              <Avatar
                size={45}
                name={item.createdByDetails?.name}
                image={item.createdByDetails?.image}
              />
              <Column gap={2}>
                <Text style={[commonStyles.subTitleText, { color: "#fff" }]}>
                  {item.createdByDetails?.name}
                </Text>
                <Text style={[commonStyles.smallText, { color: "#fff" }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </Column>
            </Row>
            <Ionicons
              onPress={() => deleteVideo(item._id)}
              name="trash"
              color={"red"}
              size={35}
            />
          </Row>
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

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      fetchVideos(currentPage + 1, true);
    }
  };

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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "black",
  },
});
