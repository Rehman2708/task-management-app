import React, { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import CustomButton from "./customButton";
import { UploadRepo } from "../repositories/upload";
import { Spacer } from "../tools";

interface Props {
  onUploadSuccess: (url: string) => void;
  isVideo?: boolean;
  currentUrl?: string;
}

export const UploadMediaButton: React.FC<Props> = ({
  onUploadSuccess,
  isVideo,
  currentUrl,
}) => {
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: isVideo
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) return;

    handleUpload(result.assets[0]);
  };

  const openCamera = async () => {
    // request permission
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission Denied", "Camera access is required");

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: isVideo
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      videoMaxDuration: 300,
    });

    if (result.canceled) return;

    handleUpload(result.assets[0]);
  };

  const handleUpload = async (asset: any) => {
    const file = {
      uri: asset.uri,
      type: isVideo ? "video/mp4" : "image/jpeg",
      name: `file_${Date.now()}.${isVideo ? "mp4" : "jpg"}`,
    };

    try {
      setLoading(true);
      const res = await UploadRepo.uploadFile(file);
      onUploadSuccess(res.url);
      if (res.url && currentUrl) {
        const deleteRes = await UploadRepo.deleteFile(currentUrl);
      }
    } catch (err) {
      Alert.alert("Upload Failed", "Something went wrong");
      console.log("[UPLOAD ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomButton
        onPress={openCamera}
        loading={loading}
        title="Upload"
        rounded
        small
        sendButton
        iconName="camera-outline"
      />
      <Spacer position="right" size={8} />
      <CustomButton
        onPress={pickFromGallery}
        loading={loading}
        title="Upload"
        rounded
        small
        sendButton
        iconName="image-outline"
      />
    </>
  );
};
