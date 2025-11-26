import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import CustomButton from "./customButton";
import { Row, Spacer } from "../tools";
import { UploadRepo } from "../repositories/upload";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";

interface UploadMediaButtonProps {
  onUploadSuccess: (url: string) => void;
  isVideo?: boolean;
  currentUrl?: string;
  disabled?: boolean;
  maxVideoSizeMB?: number;
}

export const UploadMediaButton: React.FC<UploadMediaButtonProps> = ({
  onUploadSuccess,
  isVideo = false,
  currentUrl,
  disabled = false,
  maxVideoSizeMB = 100,
}) => {
  const [cameraLoading, setCameraLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [cameraProgress, setCameraProgress] = useState(0);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const selectMedia = async (fromCamera: boolean) => {
    const setLoading = fromCamera ? setCameraLoading : setGalleryLoading;
    const setProgress = fromCamera ? setCameraProgress : setGalleryProgress;

    try {
      setLoading(true);
      setProgress(0);

      if (fromCamera) {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Camera access is required");
          return;
        }
      }

      const pickerResult = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: isVideo
              ? ImagePicker.MediaTypeOptions.Videos
              : ImagePicker.MediaTypeOptions.Images,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
            quality: isVideo ? 0.6 : 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: isVideo
              ? ImagePicker.MediaTypeOptions.Videos
              : ImagePicker.MediaTypeOptions.Images,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
            quality: isVideo ? 0.6 : 1,
          });

      if (pickerResult.canceled) {
        setLoading(false);
        setProgress(0);
        return;
      }

      const asset = pickerResult.assets[0];

      if (
        isVideo &&
        asset.fileSize &&
        asset.fileSize > maxVideoSizeMB * 1024 * 1024
      ) {
        return Alert.alert(
          "Video too large",
          `Please select a video smaller than ${maxVideoSizeMB} MB.`
        );
      }

      await uploadMedia(asset, fromCamera);
    } catch (err) {
      console.log("[SELECT MEDIA ERROR]", err);
      Alert.alert("Upload Error", "Something went wrong");
    } finally {
      // Do not reset progress here; uploadMedia will handle
    }
  };

  const uploadMedia = async (asset: any, fromCamera: boolean) => {
    const setLoading = fromCamera ? setCameraLoading : setGalleryLoading;
    const setProgress = fromCamera ? setCameraProgress : setGalleryProgress;

    let uri = asset.uri;
    if (Platform.OS === "android" && !uri.startsWith("file://"))
      uri = "file://" + uri;

    const file = {
      uri,
      type: isVideo ? "video/mp4" : "image/jpeg",
      name: `file_${Date.now()}.${isVideo ? "mp4" : "jpg"}`,
    };

    try {
      setLoading(true);
      setProgress(0);

      const res = await UploadRepo.uploadFile(file, (percent) => {
        setProgress(Math.floor(percent));
      });

      if (res.url) {
        // Wait for onUploadSuccess API to complete before stopping loader
        await onUploadSuccess(res.url);

        // Delete previous file if exists
        if (currentUrl) {
          try {
            await UploadRepo.deleteFile(currentUrl);
          } catch (err) {
            console.log("Old file delete failed", err);
          }
        }
      }
    } catch (err: any) {
      console.log("[UPLOAD ERROR]", err);
      Alert.alert(
        "Upload Failed",
        isVideo
          ? "Video upload failed. Try a smaller file or check your connection."
          : "Something went wrong - try again."
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Camera Button */}
      <CustomButton
        onPress={() => selectMedia(true)}
        loading={cameraLoading}
        title="Camera"
        disabled={disabled || cameraLoading || galleryLoading}
        sendButton
        iconName="camera-outline"
      />
      {cameraLoading && isVideo && (
        <Row justifyContent="center" style={{ width: 50 }}>
          <Text style={commonStyles.errorText}>{cameraProgress}%</Text>
        </Row>
      )}

      <Spacer position="right" size={8} />

      {/* Gallery Button */}
      <CustomButton
        onPress={() => selectMedia(false)}
        loading={galleryLoading}
        title="Gallery"
        disabled={disabled || cameraLoading || galleryLoading}
        sendButton
        iconName="image-outline"
      />
      {galleryLoading && isVideo && (
        <Row justifyContent="center" style={{ width: 50 }}>
          <Text style={commonStyles.errorText}>{galleryProgress}%</Text>
        </Row>
      )}
    </View>
  );
};
