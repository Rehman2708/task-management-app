import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import CustomButton from "./customButton";
import { Spacer } from "../tools";
import { UploadRepo } from "../repositories/upload";

interface Props {
  onUploadSuccess: (url: string) => void;
  isVideo?: boolean;
  disabled?: boolean;
  currentUrl?: string;
  maxVideoSizeMB?: number; // optional: limit video size
}

export const UploadMediaButton: React.FC<Props> = ({
  onUploadSuccess,
  isVideo = false,
  currentUrl,
  disabled = false,
  maxVideoSizeMB = 100, // default 200MB
}) => {
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const isAnyLoading = loadingCamera || loadingGallery;

  const selectMedia = async (fromCamera: boolean) => {
    try {
      fromCamera ? setLoadingCamera(true) : setLoadingGallery(true);

      // Camera permission if needed
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
            quality: 0.8,
            videoMaxDuration: 300,
            allowsEditing: isVideo ? false : true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: isVideo
              ? ImagePicker.MediaTypeOptions.Videos
              : ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: isVideo ? false : true,
          });

      if (pickerResult.canceled) return;

      const asset = pickerResult.assets[0];

      // Check video size limit
      if (
        isVideo &&
        asset.fileSize &&
        asset.fileSize > maxVideoSizeMB * 1024 * 1024
      ) {
        Alert.alert(
          "Video too large",
          `Please select a video smaller than ${maxVideoSizeMB} MB.`
        );
        return;
      }

      await uploadMedia(asset);
    } catch (err) {
      console.log("[MEDIA PICK ERROR]", err);
      Alert.alert("Error", "Something went wrong while picking media");
    } finally {
      setLoadingCamera(false);
      setLoadingGallery(false);
    }
  };

  const uploadMedia = async (asset: any) => {
    try {
      const extension = isVideo ? "mp4" : "jpg";
      const mimeType = isVideo ? "video/mp4" : "image/jpeg";

      let uri = asset.uri;

      // Ensure file:// prefix on Android/iOS
      if (Platform.OS === "android" && !uri.startsWith("file://")) {
        uri = "file://" + uri;
      }

      const file = {
        uri,
        type: mimeType,
        name: `file_${Date.now()}.${extension}`,
      };

      const res = await UploadRepo.uploadFile(file);

      if (res.url) {
        onUploadSuccess(res.url);

        // Delete previous file if exists
        if (currentUrl) {
          try {
            await UploadRepo.deleteFile(currentUrl);
          } catch (err) {
            console.log("[DELETE OLD FILE ERROR]", err);
          }
        }
      }
    } catch (err: any) {
      console.log("[UPLOAD ERROR]", err);

      if (err.message === "NETWORK") {
        Alert.alert(
          "Upload Failed",
          "No internet connection. Please try again."
        );
      } else if (err.message === "TIMEOUT") {
        Alert.alert("Upload Failed", "Server took too long. Try again later.");
      } else {
        Alert.alert(
          "Upload Failed",
          isVideo
            ? "Video upload failed. Try a smaller file or check your connection."
            : "Something went wrong - try again."
        );
      }
    }
  };

  return (
    <>
      <CustomButton
        onPress={() => selectMedia(true)}
        loading={loadingCamera}
        title="Camera"
        rounded
        small
        sendButton
        iconName="camera-outline"
        outlined
        disabled={disabled || isAnyLoading}
      />
      <Spacer position="right" size={8} />
      <CustomButton
        onPress={() => selectMedia(false)}
        loading={loadingGallery}
        title="Gallery"
        rounded
        small
        sendButton
        iconName="image-outline"
        disabled={disabled || isAnyLoading}
      />
    </>
  );
};
