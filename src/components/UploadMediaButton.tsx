import React, { useState } from "react";
import { Alert } from "react-native";
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
}

export const UploadMediaButton: React.FC<Props> = ({
  onUploadSuccess,
  isVideo,
  currentUrl,
  disabled,
}) => {
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

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

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: isVideo
              ? ImagePicker.MediaTypeOptions.Videos
              : ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            videoMaxDuration: 300,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: isVideo
              ? ImagePicker.MediaTypeOptions.Videos
              : ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: false,
          });

      if (result.canceled) return;

      const asset = result.assets[0];
      await uploadMedia(asset);
    } catch (err) {
      Alert.alert("Error", "Something went wrong while picking media");
      console.log("[MEDIA PICK ERROR]", err);
    } finally {
      setLoadingCamera(false);
      setLoadingGallery(false);
    }
  };

  const uploadMedia = async (asset: any) => {
    const extension = isVideo ? "mp4" : "jpg";
    const mimeType = isVideo ? "video/mp4" : "image/jpeg";

    const file = {
      uri: asset.uri,
      type: mimeType,
      name: `file_${Date.now()}.${extension}`,
    };

    try {
      const res = await UploadRepo.uploadFile(file);

      if (res.url) {
        onUploadSuccess(res.url);

        // delete previous file if exists
        if (currentUrl) {
          await UploadRepo.deleteFile(currentUrl);
        }
      }
    } catch (err) {
      Alert.alert("Upload Failed", "Something went wrong");
      console.log("[UPLOAD ERROR]", err);
    }
  };

  const isAnyLoading = loadingCamera || loadingGallery;

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
