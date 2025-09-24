import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Video from "react-native-video";

import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { commonStyles } from "../../styles/commonstyles";
import { CreateVideoPayload, IVideo } from "../../types/videos";
import { VideoRepo } from "../../repositories/videos";
import { theme } from "../../infrastructure/theme";
import { useHelper } from "../../utils/helper";
import { useCreateVideoViewModal } from "./useViewModal";
import CommentCard from "../../components/commentCard";
import { Column, Row, Spacer } from "../../tools";
import { styles } from "./styles";

export default function CreateVideoScreen() {
  const navigation: any = useNavigation();
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTested, setIsTested] = useState(false);
  const [isPlayable, setIsPlayable] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const { videosList, loadingVideos } = useCreateVideoViewModal();

  const { loggedInUser, themeColor, formatDate } = useHelper();

  // Reset preview if URL changes after being tested
  useEffect(() => {
    if (isTested) {
      setIsTested(false);
      setIsPlayable(false);
    }
  }, [videoUrl]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload: CreateVideoPayload = {
      title,
      url: videoUrl,
      createdBy: loggedInUser?.userId ?? "RehmanK",
    };

    try {
      await VideoRepo.createVideo(payload);
      setSuccess("Video uploaded successfully");
      setTitle("");
      setVideoUrl("");
      setIsTested(false);
      setIsPlayable(false);
    } catch (err: any) {
      console.error("Video upload error:", err);
      setError(err.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = () => {
    setError(null);
    setIsTested(true);
    setIsPlayable(false);
  };

  // Filter songs by title
  const filteredVideos = videosList.filter((item: IVideo) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper
      title="Add Video"
      showBackbutton
      subTitle="Videos > Add Video"
    >
      <Row justifyContent="flex-end">
        <Text
          style={[
            commonStyles.basicText,
            { padding: 8, color: themeColor.dark },
          ]}
          onPress={() => setModalVisible(true)}
        >
          Show Added Songs
        </Text>
      </Row>
      <View style={commonStyles.screenWrapper}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CustomInput title="Title" value={title} onChangeText={setTitle} />
          <CustomInput
            title="Video URL"
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="Enter video URL"
            multiline
            inputStyle={{ maxHeight: 200 }}
          />

          <CustomButton
            title="Test"
            onPress={handleTest}
            disabled={videoUrl.length === 0}
          />

          {isTested && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUrl }}
                style={styles.videoPlayer}
                controls
                resizeMode="contain"
                onError={(e) => {
                  console.error("Video error:", e);
                  setError("Video failed to load. Please check the URL.");
                  setIsPlayable(false);
                }}
                onLoad={() => {
                  setIsPlayable(true);
                }}
              />
            </View>
          )}

          {error && <Text style={commonStyles.errorText}>{error}</Text>}
          {success && (
            <Text
              style={{ ...commonStyles.errorText, color: theme.colors.success }}
            >
              {success}
            </Text>
          )}

          {isPlayable && (
            <CustomButton
              title="Upload Video"
              loading={loading}
              onPress={handleSave}
            />
          )}

          <Spacer size={30} />
        </KeyboardAwareScrollView>
      </View>

      {/* Modal for History */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={commonStyles.titleText}>
            Added Songs({filteredVideos.length})
          </Text>
          <Spacer size={12} />

          <CustomInput
            placeholder="Search by title"
            value={search}
            onChangeText={setSearch}
          />

          <Spacer size={12} />

          {loadingVideos ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <FlatList
              data={filteredVideos}
              showsVerticalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }: { item: IVideo }) => (
                <CommentCard
                  text={item.title}
                  image={item?.createdByDetails?.image}
                  name={item?.createdByDetails?.name!}
                  time={formatDate(item.createdAt)}
                  userId=""
                  repeated
                />
              )}
              ListEmptyComponent={
                <Text style={commonStyles.errorText}>No songs found</Text>
              }
            />
          )}

          <Spacer size={20} />
          <CustomButton title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
