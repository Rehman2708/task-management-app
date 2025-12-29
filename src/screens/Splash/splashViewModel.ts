import { useState } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { IUser } from "../../types/auth";
import { useNotificationStore } from "../../store/notificationStore";
import { handleNotificationNavigation } from "../../../notification";
import { BiometricSettings } from "../../utils/biometricSettings";
import { BiometricAuth } from "../../utils/biometricAuth";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";

export function useSplashViewModel() {
  const navigation = useNavigation();
  const { updateUser } = useAuthStore();
  const { launchedFromNotification, clearLaunchedFromNotification } =
    useNotificationStore();

  // Loading states
  const [loading, setLoading] = useState(true);

  // Biometric modal states
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricRequired, setBiometricRequired] = useState(false);
  const [allowSkipBiometric, setAllowSkipBiometric] = useState(true);

  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true);
      if (id) {
        const data = await AuthRepo.getUserDetails(id);
        if (data?.user) {
          updateUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMainApp = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.TABS }],
      })
    );

    // Handle notification navigation after successful authentication
    if (launchedFromNotification) {
      setTimeout(() => {
        handleNotificationNavigation(launchedFromNotification);
        clearLaunchedFromNotification();
      }, 500);
    }
  };

  const navigateToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      })
    );
  };

  const checkBiometricAndNavigate = async (user: IUser) => {
    try {
      const biometricStatus = await BiometricSettings.shouldPromptBiometric();

      if (biometricStatus.shouldPrompt) {
        // Show modal instead of navigating to screen
        setBiometricRequired(true);
        setAllowSkipBiometric(false);
        setShowBiometricModal(true);
      } else if (biometricStatus.isFirstTime) {
        await BiometricAuth.showEnableBiometricAlert(
          async () => {
            await BiometricSettings.setBiometricSetting(true);
            // Show modal instead of navigating to screen
            setBiometricRequired(false);
            setAllowSkipBiometric(true);
            setShowBiometricModal(true);
          },
          async () => {
            await BiometricSettings.setBiometricSetting(false);
            navigateToMainApp();
          }
        );
      } else {
        navigateToMainApp();
      }
    } catch (error) {
      console.error("Error checking biometric auth:", error);
      navigateToMainApp();
    }
  };

  const handleBiometricSuccess = () => {
    setShowBiometricModal(false);

    // If there's a pending notification, navigate to tabs first then to notification
    if (launchedFromNotification) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.TABS }],
        })
      );

      // Navigate to notification target after tabs are loaded
      setTimeout(() => {
        handleNotificationNavigation(launchedFromNotification);
        clearLaunchedFromNotification();
      }, 500);
    } else {
      // Normal navigation to tabs
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.TABS }],
        })
      );
    }
  };

  const handleBiometricSkip = () => {
    setShowBiometricModal(false);

    // If there's a pending notification, navigate to tabs first then to notification
    if (launchedFromNotification) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.TABS }],
        })
      );

      // Navigate to notification target after tabs are loaded
      setTimeout(() => {
        handleNotificationNavigation(launchedFromNotification);
        clearLaunchedFromNotification();
      }, 500);
    } else {
      // Normal navigation to tabs
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.TABS }],
        })
      );
    }
  };

  const initializeApp = async () => {
    try {
      const { data: user, success } = await getDataFromAsyncStorage(
        LocalStorageKey.USER
      );
      updateUser(user as IUser);

      if (success && user) {
        const userData = user as IUser;
        await fetchUserDetails(userData.userId);
        await checkBiometricAndNavigate(userData);
      } else {
        navigateToLogin();
      }
    } catch (error) {
      console.error("Error in splash screen:", error);
      navigateToLogin();
    }
  };

  return {
    // States
    loading,
    showBiometricModal,
    biometricRequired,
    allowSkipBiometric,

    // Actions
    initializeApp,
    handleBiometricSuccess,
    handleBiometricSkip,
  };
}
