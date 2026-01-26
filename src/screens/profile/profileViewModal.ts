import React, { useEffect, useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import {
  CommonActions,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import * as Device from "expo-device";
import { InteractionManager } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import ToastService from "../../utils/toastService";
import { BiometricSettings } from "../../utils/biometricSettings";
import { BiometricAuth } from "../../utils/biometricAuth";

export function useProfileViewModel() {
  const { updateUser, user, logout: storeLogout } = useAuthStore();
  const { clearLaunchedFromNotification, setAppInForeground } =
    useNotificationStore();
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [partnerInput, setPartnerInput] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [biometricDisplayText, setBiometricDisplayText] =
    useState("🔐 Biometric Auth");
  const [imageViewVisible, setImageViewVisible] = useState<
    ((visible: boolean) => void) | null
  >(null);

  const [showBiometricAlert, setShowBiometricAlert] = useState(false);
  const [biometricAlertTitle, setBiometricAlertTitle] = useState("");
  const [biometricAlertSubTitle, setBiometricAlertSubTitle] = useState("");
  const [biometricAlertError, setBiometricAlertError] = useState(false);
  const [biometricAlertLoading, setBiometricAlertLoading] = useState(false);
  const [biometricAlertOnConfirm, setBiometricAlertOnConfirm] = useState<
    (() => void) | null
  >(null);

  const addPartner = async (partner: string) => {
    setLoading(true);
    try {
      if (!user) {
        ToastService.error({
          title: "Error",
          message: "User not found",
        });
        return false;
      }

      const response = await AuthRepo.connectPartner({
        userId: user.userId,
        partnerUserId: partner,
      });
      if (response?.success && response?.user) {
        updateUser(response.user);
      }
    } catch (err: any) {
      ToastService.error({
        title: "Error",
        message: `${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const navigation: any = useNavigation();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // First, close all modals
      setShowAlert(false);
      hideBiometricAlert();
      if (imageViewVisible) {
        imageViewVisible(false);
      }

      // Hide any active toasts immediately
      ToastService.hide();

      // Wait for all interactions to complete
      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(resolve, 300);
        });
      });

      if (user?.userId) {
        if (Device.isDevice) {
          await AuthRepo.logout(user?.userId);
        }

        // Clear all stores and state
        await storeLogout();

        // Clear notification store
        clearLaunchedFromNotification();
        setAppInForeground(true);

        // Wait for another interaction cycle before navigation
        await new Promise((resolve) => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(resolve, 100);
          });
        });

        // Reset navigation stack
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          }),
        );
      }
    } catch (error) {
      console.log("Something went wrong during logout:", error);
      setLoggingOut(false);
    }
    // Note: Don't set setLoggingOut(false) in finally block since we're navigating away
  };

  const showBiometricAlertModal = (
    title: string,
    subTitle: string,
    onConfirm?: () => void,
    error: boolean = false,
    loading: boolean = false,
  ) => {
    setBiometricAlertTitle(title);
    setBiometricAlertSubTitle(subTitle);
    setBiometricAlertError(error);
    setBiometricAlertLoading(loading);
    setBiometricAlertOnConfirm(onConfirm ? () => onConfirm : null);
    setShowBiometricAlert(true);
  };

  const hideBiometricAlert = () => {
    setShowBiometricAlert(false);
    setBiometricAlertLoading(false);
  };

  const toggleBiometricAuth = async () => {
    try {
      const capabilities = await BiometricAuth.getCapabilities(true);

      if (!capabilities.hasHardware) {
        showBiometricAlertModal(
          "Not Supported",
          "This device doesn't support biometric authentication.",
        );
        return;
      }

      if (!capabilities.isEnrolled) {
        showBiometricAlertModal(
          `${capabilities.primaryType} Not Set Up`,
          `No ${capabilities.primaryType.toLowerCase()} data is enrolled on this device. Please set up ${capabilities.primaryType.toLowerCase()} in your device settings first.`,
          () => {
            hideBiometricAlert();
            setTimeout(() => {
              showBiometricAlertModal(
                "Setup Instructions",
                `To set up ${capabilities.primaryType}:\n\n1. Go to your device Settings\n2. Find Security or ${capabilities.primaryType} settings\n3. Follow the setup instructions\n4. Return to this app and try again`,
              );
            }, 300);
          },
        );
        return;
      }

      const currentSetting = await BiometricSettings.getBiometricSetting();
      const biometricType = capabilities.primaryType;

      if (currentSetting) {
        showBiometricAlertModal(
          `Disable ${biometricType}`,
          `Are you sure you want to disable ${biometricType} authentication?\n\nYou will need to enter your credentials each time you open the app.`,
          async () => {
            setBiometricAlertLoading(true);
            try {
              await BiometricSettings.setBiometricSetting(false);
              await updateBiometricDisplayText(true);
              hideBiometricAlert();
              setTimeout(() => {
                showBiometricAlertModal(
                  "Disabled",
                  `${biometricType} authentication has been disabled.`,
                );
              }, 300);
            } catch (error) {
              setBiometricAlertLoading(false);
              showBiometricAlertModal(
                "Error",
                "Failed to disable biometric authentication. Please try again.",
                undefined,
                true,
              );
            }
          },
          true,
        );
      } else {
        showBiometricAlertModal(
          `Enable ${biometricType}`,
          `Would you like to enable ${biometricType} authentication for faster and more secure access?\n\nYou can disable this anytime in your profile settings.`,
          async () => {
            setBiometricAlertLoading(true);
            try {
              const result = await BiometricAuth.authenticate(
                `Use ${biometricType} to enable secure login`,
                false,
              );

              if (result.success) {
                await BiometricSettings.setBiometricSetting(true);
                await updateBiometricDisplayText(true);
                hideBiometricAlert();
                setTimeout(() => {
                  showBiometricAlertModal(
                    "Enabled",
                    `${biometricType} authentication has been enabled successfully!`,
                  );
                }, 300);
              } else {
                setBiometricAlertLoading(false);
                let errorTitle = "Authentication Failed";
                let errorMessage =
                  result.error || "Could not enable biometric authentication.";

                if (result.authType === "passcode") {
                  errorTitle = "Passcode Used";
                  errorMessage = `You used your device passcode instead of ${biometricType}. Please try again and use ${biometricType} to enable this feature.`;
                }

                showBiometricAlertModal(
                  errorTitle,
                  errorMessage,
                  () => {
                    hideBiometricAlert();
                    setTimeout(() => toggleBiometricAuth(), 300);
                  },
                  true,
                );
              }
            } catch (error) {
              console.error("Error enabling biometric auth:", error);
              setBiometricAlertLoading(false);
              showBiometricAlertModal(
                "Error",
                "An unexpected error occurred. Please try again.",
                undefined,
                true,
              );
            }
          },
        );
      }
    } catch (error) {
      console.error("Error toggling biometric auth:", error);
      showBiometricAlertModal(
        "Error",
        "An error occurred while updating biometric settings. Please try again.",
        undefined,
        true,
      );
    }
  };

  const updateBiometricDisplayText = async (forceRefresh: boolean = false) => {
    const displayText =
      await BiometricSettings.getBiometricDisplayText(forceRefresh);
    setBiometricDisplayText(displayText);
  };

  const changeThemeScreen = () => navigation.navigate(ROUTES.THEME);
  const changeFontScreen = () => navigation.navigate(ROUTES.FONT);
  const createVideoScreen = () => navigation.navigate(ROUTES.CREATE_VIDEO);
  const resetPasswordScreen = () => navigation.navigate(ROUTES.RESET_PASSWORD);
  const updateProfileScreen = () => navigation.navigate(ROUTES.UPDATE_PROFILE);
  const addEmailScreen = () => navigation.navigate(ROUTES.ADD_EMAIL);
  const testToastScreen = () => navigation.navigate(ROUTES.TEST_TOAST);
  const calendarScreen = () => navigation.navigate(ROUTES.CALENDAR);

  function startCountdown(
    targetDate: Date | string,
    callback: (text: string) => void,
  ) {
    function update() {
      const now: Date = new Date();
      const endDate: Date = new Date(targetDate);

      const diffMs = Number(endDate) - Number(now);
      if (diffMs <= 0) {
        callback("Date has already passed");
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const seconds = totalSeconds % 60;

      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;

      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;

      const totalDays = Math.floor(totalHours / 24);

      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;

      const output = `${months} month ${days} day ${hours}h ${minutes}m ${seconds}s left. i.e ${totalDays} days`;
      callback(output);
    }

    update();
    return setInterval(update, 1000);
  }

  useEffect(() => {
    updateBiometricDisplayText();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      updateBiometricDisplayText(true);
    }, []),
  );

  const partnerId = user?.partner?.userId;
  const partnerImage = user?.partner?.image;

  const fetchUserDetails = async () => {
    try {
      setLoadingUserDetail(true);
      if (user?.userId) {
        const data = await AuthRepo.getUserDetails(user.userId);
        if (data?.user) {
          updateUser(data.user);
          await updateBiometricDisplayText(true);
          return data.user;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  return {
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
    partnerInput,
    setPartnerInput,
    partnerImage,
    loadingUserDetail,
    fetchUserDetails,
    resetPasswordScreen,
    addEmailScreen,
    testToastScreen,
    calendarScreen,
    biometricDisplayText,
    showBiometricAlert,
    biometricAlertTitle,
    biometricAlertSubTitle,
    biometricAlertError,
    biometricAlertLoading,
    biometricAlertOnConfirm,
    hideBiometricAlert,
    setImageViewVisible,
  };
}
