import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Video from "react-native-video";

import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { commonStyles } from "../../styles/commonstyles";
import { CreateVideoPayload } from "../../types/videos";
import { VideoRepo } from "../../repositories/videos";
import { theme } from "../../infrastructure/theme";

export default function CreateVideoScreen() {
  const navigation: any = useNavigation();
  const [title, setTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTested, setIsTested] = useState<boolean>(false);
  const [isPlayable, setIsPlayable] = useState<boolean>(false);

  const { loggedInUser } = { loggedInUser: { userId: "123" } }; // replace with auth hook

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
      createdBy: loggedInUser.userId,
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

  return (
    <ScreenWrapper
      title="Add Video"
      showBackbutton
      subTitle="Videos > Add Video"
    >
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
        </KeyboardAwareScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height: 300,
    marginVertical: 10,
  },
  videoPlayer: {
    flex: 1,
    borderRadius: 8,
  },
});
