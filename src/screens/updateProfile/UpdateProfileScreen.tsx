import { View, Text, Image, Pressable } from "react-native";
import React, { useState, useMemo } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import ImageModal from "../../components/imageModal";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { Row } from "../../tools";
import { useCommonStyles } from "../../styles/commonstyles";
import { useHelper } from "../../utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../profile/ProfileScreen";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useTheme } from "../../infrastructure/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const UpdateProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const { themeColor, getInitials } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const ProfileScreenStyles = styles(theme);
  const [userImage, setUserImage] = useState(user?.image ?? "");
  const [userName, setUserName] = useState(user?.name ?? "");
  const [userAbout, setUserAbout] = useState(user?.about ?? "");
  const [loading, setLoading] = useState(false);

  // 🔹 Detect if there’s any change (name or image)
  const hasChanges = useMemo(() => {
    return (
      userName.trim() !== (user?.name ?? "").trim() ||
      userAbout.trim() !== (user?.about ?? "").trim() ||
      userImage !== (user?.image ?? "")
    );
  }, [userName, userImage, user, userAbout]);

  const updateProfile = async () => {
    try {
      if (!user?.userId || !hasChanges) return;

      setLoading(true);
      const res = await AuthRepo.updateProfile({
        userId: user.userId,
        name: userName.trim(),
        about: userAbout.trim(),
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
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <ImageModal
          onChange={updateProfilePicture}
          defaultImage={userImage}
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
                  <Ionicons name="trash" color={theme.colors.error} size={20} />
                </Pressable>
              ) : null}
            </Row>
          }
        />
        <CustomInput
          title="User Id"
          editable={false}
          value={user?.userId}
          onChangeText={() => {}}
        />
        <CustomInput title="Name" onChangeText={setUserName} value={userName} />
        <CustomInput
          title="About"
          onChangeText={setUserAbout}
          value={userAbout}
          multiline
        />
        {hasChanges && (
          <CustomButton
            title={loading ? "Updating..." : "Update"}
            onPress={updateProfile}
            disabled={loading || !userName.trim()}
          />
        )}
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default UpdateProfileScreen;
