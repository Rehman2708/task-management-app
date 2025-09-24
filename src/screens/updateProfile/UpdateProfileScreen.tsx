import { View, Text, Image, Pressable } from "react-native";
import React, { useState, useMemo } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import ImageModal from "../../components/imageModal";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { Row } from "../../tools";
import { commonStyles } from "../../styles/commonstyles";
import { useHelper } from "../../utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../infrastructure/theme";
import { ProfileScreenStyles } from "../profile/ProfileScreen";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";

const UpdateProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const { themeColor, getInitials } = useHelper();

  const [userImage, setUserImage] = useState(user?.image ?? "");
  const [userName, setUserName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  // 🔹 Detect if there’s any change (name or image)
  const hasChanges = useMemo(() => {
    return (
      userName.trim() !== (user?.name ?? "").trim() ||
      userImage !== (user?.image ?? "")
    );
  }, [userName, userImage, user]);

  const updateProfile = async () => {
    try {
      if (!user?.userId || !hasChanges) return;

      setLoading(true);
      const res = await AuthRepo.updateProfile({
        userId: user.userId,
        name: userName.trim(),
        image: userImage || null,
      });

      if (res?.user) {
        updateUser(res.user);
      }
    } catch (error) {
      console.log("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = (image: string | null) => {
    setUserImage(image ?? "");
  };

  return (
    <ScreenWrapper showBackbutton title="Update Profile">
      <ImageModal
        onChange={updateProfilePicture}
        button={
          <Row
            justifyContent="center"
            alignItems="center"
            style={[
              commonStyles.cardContainer,
              commonStyles.secondaryContainer,
              ProfileScreenStyles.imageContainer,
              {
                backgroundColor: `${themeColor.light}20`,
              },
            ]}
          >
            {userImage ? (
              <Image
                style={ProfileScreenStyles.image}
                source={{ uri: userImage }}
              />
            ) : (
              <Text
                style={[
                  ProfileScreenStyles.nameText,
                  { color: themeColor?.dark ?? theme.colors.primary },
                ]}
              >
                {getInitials(user?.name)}
              </Text>
            )}
            {userImage ? (
              <Pressable
                style={ProfileScreenStyles.deleteIcon}
                onPress={() => setUserImage("")}
              >
                <Ionicons name="trash" color={"#fff"} size={20} />
              </Pressable>
            ) : null}
          </Row>
        }
      />

      <CustomInput title="Name" onChangeText={setUserName} value={userName} />

      {hasChanges && (
        <CustomButton
          title={loading ? "Updating..." : "Update"}
          onPress={updateProfile}
          disabled={loading || !userName.trim()}
        />
      )}
    </ScreenWrapper>
  );
};

export default UpdateProfileScreen;
