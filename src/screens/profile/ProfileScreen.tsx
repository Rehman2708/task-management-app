import React, { useState, useEffect } from "react";
import {
  Text,
  Pressable,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useProfileViewModel } from "./profileViewModal";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useHelper } from "../../utils/helper";
import { Ionicons } from "@expo/vector-icons";
import ScreenLoader from "../../components/screenLoader";
import ImageModal from "../../components/imageModal";
import ImageView from "react-native-image-viewing";

export default function ProfileScreen() {
  const {
    user,
    loading,
    partnerId,
    fetchUserDetails,
    addPartner,
    logout,
    changeThemeScreen,
    createVideoScreen,
    loggingOut,
    userImage,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    updateProfilePicture,
    partnerImage,
  } = useProfileViewModel();
  const { getInitials, themeColor } = useHelper();
  const [visible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState({});
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <ScreenWrapper title="Profile">
      {loading ? (
        <ScreenLoader />
      ) : (
        <>
          <Column gap={isAndroid ? 6 : 8} style={[commonStyles.screenWrapper]}>
            <Row justifyContent="center" alignItems="center" gap={8}>
              <ImageModal
                onChange={updateProfilePicture}
                button={
                  <Row
                    justifyContent="center"
                    alignItems="center"
                    style={[
                      commonStyles.cardContainer,
                      commonStyles.secondaryContainer,
                      styles.imageContainer,
                      {
                        backgroundColor: `${themeColor.light}20`,
                      },
                    ]}
                  >
                    {userImage ? (
                      <Image style={styles.image} source={{ uri: userImage }} />
                    ) : (
                      <Text
                        style={[
                          styles.nameText,
                          { color: themeColor?.dark ?? theme.colors.primary },
                        ]}
                      >
                        {getInitials(user?.name)}
                      </Text>
                    )}
                    <Pressable
                      style={styles.deleteIcon}
                      onPress={() => updateProfilePicture("")}
                    >
                      <Ionicons name="trash" color={"#fff"} size={20} />
                    </Pressable>
                  </Row>
                }
              />
              {partnerId && <Ionicons name="heart" size={40} color={"red"} />}
              {partnerId && (
                <Row
                  justifyContent="center"
                  alignItems="center"
                  style={[
                    commonStyles.cardContainer,
                    commonStyles.secondaryContainer,
                    styles.imageContainer,
                    {
                      backgroundColor: `${themeColor.light}20`,
                    },
                  ]}
                >
                  {partnerImage ? (
                    <Pressable
                      onPress={() => {
                        setCurrentImage({ uri: partnerImage });
                        setIsVisible(true);
                      }}
                    >
                      <Image
                        style={styles.image}
                        source={{ uri: partnerImage }}
                      />
                    </Pressable>
                  ) : (
                    <Text
                      style={[
                        styles.nameText,
                        { color: themeColor?.dark ?? theme.colors.primary },
                      ]}
                    >
                      {getInitials(partnerId ?? "")}
                    </Text>
                  )}
                </Row>
              )}
            </Row>

            <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
              <Text style={[commonStyles.smallText]}>Name:</Text>
              <Text style={[commonStyles.subTitleText]}>
                {user?.name || "N/A"}
              </Text>
            </Row>
            {/* <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
              <Text style={[commonStyles.smallText]}>UserId:</Text>
              <Text style={[commonStyles.subTitleText]}>
                {user?.userId || "N/A"}
              </Text>
            </Row> */}
            {partnerId ? (
              <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
                <Text style={[commonStyles.smallText]}>Partner:</Text>
                <Text style={[commonStyles.subTitleText]}>
                  {partnerId || "N/A"}
                </Text>
              </Row>
            ) : (
              <Column>
                <Spacer size={50} />
                <Text style={[commonStyles.basicText]}>Add Partner Id:</Text>

                <CustomInput
                  value={partnerInput}
                  onChangeText={setPartnerInput}
                />

                <CustomButton
                  title="Add"
                  outlined
                  onPress={() => {
                    if (!partnerInput) {
                      Alert.alert("Error", "Please enter Partner ID");
                      return;
                    }
                    addPartner(partnerInput);
                    setPartnerInput("");
                  }}
                />
              </Column>
            )}
            <Spacer size={20} />
            <TouchableOpacity onPress={changeThemeScreen}>
              <Row
                style={commonStyles.cardContainer}
                justifyContent="space-between"
                alignItems="center"
              >
                <Text style={[commonStyles.basicText]}>Change theme</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </Row>
            </TouchableOpacity>
            <TouchableOpacity onPress={createVideoScreen}>
              <Row
                style={commonStyles.cardContainer}
                justifyContent="space-between"
                alignItems="center"
              >
                <Text style={[commonStyles.basicText]}>Add Video</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </Row>
            </TouchableOpacity>
            <Text style={commonStyles.smallText}>{getTimeLeft()}</Text>
          </Column>
          <Row style={{ paddingHorizontal: isAndroid ? 10 : 16 }}>
            <CustomButton
              rounded
              title="Logout"
              onPress={logout}
              error
              loading={loggingOut}
            />
          </Row>
        </>
      )}
      <ImageView
        images={[currentImage]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 120,
    height: 120,
    marginVertical: 20,
    position: "relative",
  },
  deleteIcon: {
    position: "absolute",
    right: -3,
    top: -3,
    borderRadius: 100,
    backgroundColor: theme.colors.error,
    padding: 8,
  },
  image: {
    height: 120,
    width: 120,
  },
  nameText: {
    fontSize: 50,
    fontFamily: theme.fonts.bold,
  },
});
