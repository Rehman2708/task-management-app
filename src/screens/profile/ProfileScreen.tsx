import { useState, useEffect } from "react";
import {
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
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
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import ImageView from "react-native-image-viewing";
import AnimatedListItem from "../../components/animatedListItem";
import AlertModal from "../../components/AlertModal";
import ToastService from "../../utils/toastService";
import React from "react";

export default function ProfileScreen() {
  const {
    user,
    loading,
    partnerId,
    addPartner,
    setShowAlert,
    showAlert,
    handleLogout,
    changeThemeScreen,
    changeFontScreen,
    toggleBiometricAuth,
    createVideoScreen,
    updateProfileScreen,
    loggingOut,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    partnerImage,
    loadingUserDetail,
    fetchUserDetails,
    resetPasswordScreen,
    addEmailScreen,
    testToastScreen,
    biometricDisplayText,
    showBiometricAlert,
    biometricAlertTitle,
    biometricAlertSubTitle,
    biometricAlertError,
    biometricAlertLoading,
    biometricAlertOnConfirm,
    hideBiometricAlert,
    setImageViewVisible,
  } = useProfileViewModel();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const ProfileScreenStyles = styles(theme);
  const { getInitials, themeColor } = useHelper();
  const [visible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [footerText, setFooterText] = useState(
    currentImageIndex === 0 ? user?.about : user?.partner?.about
  );

  // Pass the setIsVisible function to the view model
  React.useEffect(() => {
    setImageViewVisible(setIsVisible);
  }, [setImageViewVisible]);

  // Update footer text when user or partner data changes
  useEffect(() => {
    setFooterText(currentImageIndex === 0 ? user?.about : user?.partner?.about);
  }, [user?.about, user?.partner?.about, currentImageIndex]);
  const imageItems = [];

  if (user?.image) {
    imageItems.push({ uri: user.image });
  }

  if (partnerImage) {
    imageItems.push({ uri: partnerImage });
  }
  const handleIndexChange = (index: number) => {
    if (index === 0 && user?.image) {
      setFooterText(user?.about ?? "");
    } else if (index === 1 && partnerImage) {
      setFooterText(user?.partner?.about ?? "");
    }
  };

  const tabs = [
    {
      title: "👤 Update profile",
      onPress: updateProfileScreen,
    },
    // Show "Add Email" option only for users without email
    ...(!user?.email
      ? [
          {
            title: "📧 Add Email",
            onPress: addEmailScreen,
          },
        ]
      : []),
    {
      title: "🎨 Change theme",
      onPress: changeThemeScreen,
    },
    {
      title: "🔤 Change font",
      onPress: changeFontScreen,
    },
    {
      title: biometricDisplayText,
      onPress: toggleBiometricAuth,
    },
    {
      title: "🔒 Reset password",
      onPress: resetPasswordScreen,
    },
    {
      title: "🎥 Add video",
      onPress: createVideoScreen,
    },
    // {
    //   title: "🧪 Test Toast",
    //   onPress: testToastScreen,
    // },
  ];
  return (
    <ScreenWrapper title="👤 Profile" noPadding>
      {loadingUserDetail ? (
        <ScreenLoader type={LoaderTypes.ProfileScreen} />
      ) : (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={loadingUserDetail}
                onRefresh={fetchUserDetails}
                colors={[themeColor.dark]}
              />
            }
            showsVerticalScrollIndicator={false}
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
                      borderRadius: 100,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      if (!user?.image) return;
                      setCurrentImageIndex(0);
                      setFooterText(user.about);
                      setIsVisible(true);
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
                        borderRadius: 100,
                      },
                    ]}
                  >
                    {partnerImage ? (
                      <Pressable
                        onPress={() => {
                          if (!partnerImage) return;
                          const index = user?.image ? 1 : 0;
                          setCurrentImageIndex(index);
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
                          {
                            color:
                              user?.partner?.theme?.dark ??
                              theme.colors.primary,
                          },
                        ]}
                      >
                        {getInitials(user?.partner?.name ?? "")}
                      </Text>
                    )}
                  </Row>
                )}
              </Row>

              <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
                <Text style={[commonStyles.smallText]}>👤 Name:</Text>
                <Text style={[commonStyles.subTitleText]}>
                  {user?.name || "N/A"}
                </Text>
              </Row>
              {user?.email && (
                <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
                  <Text style={[commonStyles.smallText]}>📧 Email:</Text>
                  <Text style={[commonStyles.subTitleText]}>{user.email}</Text>
                </Row>
              )}
              {user?.about && (
                <Row gap={isAndroid ? 6 : 8}>
                  <Text style={[commonStyles.smallText]}>💭 About me:</Text>
                  <Text style={[commonStyles.subTitleText, { maxWidth: 300 }]}>
                    {user.about}
                  </Text>
                </Row>
              )}
              {partnerId ? (
                <>
                  <Row gap={isAndroid ? 6 : 8} alignItems="flex-end">
                    <Text style={[commonStyles.smallText]}>👥 Partner:</Text>
                    <Text style={[commonStyles.subTitleText]}>
                      {user?.partner?.name || "N/A"}
                    </Text>
                  </Row>
                  {user?.partner?.about && (
                    <Row gap={isAndroid ? 6 : 8}>
                      <Text style={[commonStyles.smallText]}>
                        💭 About partner:
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
                  <Text style={[commonStyles.basicText]}>
                    👥 Add Partner Id:
                  </Text>

                  <CustomInput
                    value={partnerInput}
                    onChangeText={setPartnerInput}
                  />

                  <CustomButton
                    title="➕ Add"
                    outlined
                    loading={loading}
                    onPress={async () => {
                      if (!partnerInput) {
                        ToastService.error({
                          title: "Error",
                          message: "Please enter Partner ID",
                        });
                        return;
                      }
                      const success = await addPartner(partnerInput);
                      if (success) {
                        setPartnerInput("");
                      }
                    }}
                  />
                </Column>
              )}
              <Spacer size={20} />
              <Text style={commonStyles.smallText}>{getTimeLeft()}</Text>
              <Spacer size={20} />

              {tabs.map((item, index) => {
                return (
                  <AnimatedListItem key={index}>
                    <TouchableOpacity
                      onPress={item.onPress}
                      disabled={item.loading}
                    >
                      <Row
                        style={[commonStyles.cardContainer]}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text style={[commonStyles.basicText]}>
                          {item.title}
                        </Text>
                        {item.loading ? (
                          <ActivityIndicator
                            size="small"
                            color={theme.colors.primary}
                          />
                        ) : (
                          <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color={theme.colors.text}
                          />
                        )}
                      </Row>
                    </TouchableOpacity>
                  </AnimatedListItem>
                );
              })}
              <TouchableOpacity
                disabled={loggingOut}
                onPress={() => setShowAlert(true)}
              >
                <Row
                  style={[{ height: 50 }]}
                  justifyContent="center"
                  alignItems="center"
                >
                  {loggingOut ? (
                    <ActivityIndicator
                      size={"small"}
                      color={theme.colors.error}
                    />
                  ) : (
                    <Text
                      style={[
                        commonStyles.subTitleText,
                        { color: theme.colors.error },
                      ]}
                    >
                      🚪 Logout
                    </Text>
                  )}
                </Row>
              </TouchableOpacity>
            </Column>
          </ScrollView>
          <Spacer size={100} />
        </>
      )}
      <ImageView
        images={imageItems}
        visible={visible}
        imageIndex={currentImageIndex}
        backgroundColor={theme.colors.background}
        swipeToCloseEnabled
        onRequestClose={() => setIsVisible(false)}
        onImageIndexChange={handleIndexChange}
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
      {showAlert && (
        <AlertModal
          isVisible={showAlert}
          onClose={() => setShowAlert(false)}
          onConfirm={handleLogout}
          title={"🚪 Logout"}
          subTitle={"Are you sure you want to logout?"}
          error
          loading={loggingOut}
        />
      )}

      {/* Biometric Settings AlertModal */}
      {showBiometricAlert && (
        <AlertModal
          isVisible={showBiometricAlert}
          onClose={hideBiometricAlert}
          onConfirm={biometricAlertOnConfirm}
          title={biometricAlertTitle}
          subTitle={biometricAlertSubTitle}
          error={biometricAlertError}
          loading={biometricAlertLoading}
        />
      )}
    </ScreenWrapper>
  );
}

export const styles = (theme: any) =>
  StyleSheet.create({
    imageContainer: {
      width: 140,
      height: 140,
      marginVertical: 20,
      position: "relative",
    },
    deleteIcon: {
      position: "absolute",
      bottom: 0,
      backgroundColor: "#00000060",
      padding: 6,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    image: {
      height: 140,
      width: 140,
    },
    nameText: {
      fontSize: 50,
      fontFamily: theme.fonts.bold,
    },
  });
