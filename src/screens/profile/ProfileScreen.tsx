import { useState } from "react";
import {
  Text,
  Pressable,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../infrastructure/theme";
import { useProfileViewModel } from "./profileViewModal";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useHelper } from "../../utils/helper";
import { Ionicons } from "@expo/vector-icons";
import ScreenLoader from "../../components/screenLoader";
import ImageView from "react-native-image-viewing";
import TextTicker from "react-native-text-ticker";

export default function ProfileScreen() {
  const {
    user,
    loading,
    partnerId,
    addPartner,
    logout,
    changeThemeScreen,
    changeFontScreen,
    createVideoScreen,
    updateProfileScreen,
    loggingOut,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    partnerImage,
    loadingUserDetail,
    fetchUserDetails,
  } = useProfileViewModel();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const ProfileScreenStyles = styles(theme);
  const { getInitials, themeColor } = useHelper();
  const [visible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState({});
  const [footerText, setFooterText] = useState(user?.about);

  return (
    <ScreenWrapper title="Profile">
      {loading ? (
        <ScreenLoader />
      ) : (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={loadingUserDetail}
                onRefresh={fetchUserDetails}
                colors={[theme.colors.primary]}
              />
            }
          >
            <Column
              gap={isAndroid ? 6 : 8}
              style={[commonStyles.screenWrapper]}
            >
              <Row justifyContent="center" alignItems="center" gap={8}>
                <Row
                  justifyContent="center"
                  alignItems="center"
                  style={[
                    commonStyles.cardContainer,
                    commonStyles.secondaryContainer,
                    ProfileScreenStyles.imageContainer,
                    {
                      backgroundColor: `${themeColor.light}20`,
                      borderColor: user?.theme.dark,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      if (user?.image) {
                        setCurrentImage({ uri: user.image });
                        setFooterText(user.about);
                        setIsVisible(true);
                      }
                    }}
                  >
                    {user?.image ? (
                      <Image
                        style={ProfileScreenStyles.image}
                        source={{ uri: user.image }}
                      />
                    ) : (
                      <Text
                        style={[
                          ProfileScreenStyles.nameText,
                          { color: themeColor?.dark ?? theme.colors.primary },
                        ]}
                      >
                        {getInitials(user?.name ?? "")}
                      </Text>
                    )}
                  </Pressable>
                </Row>
                {partnerId && <Ionicons name="heart" size={40} color={"red"} />}
                {partnerId && (
                  <Row
                    justifyContent="center"
                    alignItems="center"
                    style={[
                      commonStyles.cardContainer,
                      commonStyles.secondaryContainer,
                      ProfileScreenStyles.imageContainer,
                      {
                        backgroundColor: `${user?.partner?.theme?.light}20`,
                        borderColor: user?.partner?.theme?.light,
                      },
                    ]}
                  >
                    {partnerImage ? (
                      <Pressable
                        onPress={() => {
                          setCurrentImage({ uri: partnerImage });
                          setFooterText(user?.partner?.about);
                          setIsVisible(true);
                        }}
                      >
                        <Image
                          style={ProfileScreenStyles.image}
                          source={{ uri: partnerImage }}
                        />
                      </Pressable>
                    ) : (
                      <Text
                        style={[
                          ProfileScreenStyles.nameText,
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
              {user?.about && (
                <Row gap={isAndroid ? 6 : 8}>
                  <Text style={[commonStyles.smallText]}>About me:</Text>
                  <Text style={[commonStyles.subTitleText, { maxWidth: 300 }]}>
                    {user.about}
                  </Text>
                </Row>
              )}
              {partnerId ? (
                <>
                  <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
                    <Text style={[commonStyles.smallText]}>Partner:</Text>
                    <Text
                      style={[
                        commonStyles.subTitleText,
                        // { fontFamily: `${user?.partner?.font}SemiBold` },
                      ]}
                    >
                      {user?.partner?.name || "N/A"}
                    </Text>
                  </Row>
                  {user?.partner?.about && (
                    <Row gap={isAndroid ? 6 : 8}>
                      <Text style={[commonStyles.smallText]}>
                        About partner:
                      </Text>
                      <Text
                        style={[
                          commonStyles.subTitleText,
                          {
                            fontFamily: `${user.partner.font}Bold`,
                            maxWidth: 300,
                          },
                        ]}
                      >
                        {user.partner.about}
                      </Text>
                    </Row>
                  )}
                </>
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
              <TouchableOpacity onPress={updateProfileScreen}>
                <Row
                  style={commonStyles.cardContainer}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text style={[commonStyles.basicText]}>Update profile</Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={theme.colors.text}
                  />
                </Row>
              </TouchableOpacity>
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
              <TouchableOpacity onPress={changeFontScreen}>
                <Row
                  style={commonStyles.cardContainer}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text style={[commonStyles.basicText]}>Change font</Text>
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
          </ScrollView>
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
        swipeToCloseEnabled
        backgroundColor={theme.colors.background}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        presentationStyle="overFullScreen"
        FooterComponent={() => (
          <Text
            style={[
              commonStyles.titleText,
              { textAlign: "center", paddingBottom: 16 },
            ]}
          >
            {footerText}
          </Text>
        )}
      />
    </ScreenWrapper>
  );
}

export const styles = (theme: any) =>
  StyleSheet.create({
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
