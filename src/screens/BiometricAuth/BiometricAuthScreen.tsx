import React, { useEffect, useState } from "react";
import { Text, Pressable, BackHandler } from "react-native";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";
import { Column, Row, Spacer } from "../../tools";
import { Ionicons } from "@expo/vector-icons";
import { BiometricAuth } from "../../utils/biometricAuth";
import {
  CommonActions,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import CustomButton from "../../components/customButton";
import { useHelper } from "../../utils/helper";
import ScreenWrapper from "../../components/ScreenWrapper";
import { BiometricSettings } from "../../utils/biometricSettings";
import AlertModal from "../../components/AlertModal";

interface BiometricAuthScreenProps {
  route?: {
    params?: {
      onSuccess?: () => void;
      onSkip?: () => void;
      allowSkip?: boolean;
      isRequired?: boolean;
    };
  };
}

export default function BiometricAuthScreen({
  route,
}: BiometricAuthScreenProps) {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const navigation = useNavigation();
  const { themeColor } = useHelper();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [biometricIcon, setBiometricIcon] = useState<string>(
    "shield-checkmark-outline"
  );
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const onSuccess = route?.params?.onSuccess;
  const onSkip = route?.params?.onSkip;
  const allowSkip = route?.params?.allowSkip ?? true;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (allowSkip && !isRequired) {
          handleSkip();
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [allowSkip, isRequired])
  );

  useEffect(() => {
    initializeBiometricInfo();
  }, []);

  const initializeBiometricInfo = async () => {
    try {
      const biometricSetting = await BiometricSettings.getBiometricSetting();
      setIsRequired(biometricSetting === true);

      const capabilities = await BiometricAuth.getCapabilities();
      setBiometricType(capabilities.primaryType);
      setBiometricIcon(
        BiometricAuth.getBiometricIcon(capabilities.primaryType)
      );

      setTimeout(() => {
        if (!isAuthenticating) {
          handleBiometricAuth();
        }
      }, 1000);
    } catch (error) {
      console.error("Error initializing biometric info:", error);
      setBiometricType("Biometric");
      setBiometricIcon("shield-checkmark-outline");
    }
  };

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setIsRetrying(false);

    try {
      const result = await BiometricAuth.authenticate(
        `Use ${biometricType} to access your tasks`,
        false
      );

      if (result.success) {
        const currentSetting = await BiometricSettings.getBiometricSetting();
        if (currentSetting === null) {
          await BiometricSettings.setBiometricSetting(true);
        }

        if (onSuccess) {
          onSuccess();
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: ROUTES.TABS }],
            })
          );
        }
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        let alertTitle = "Authentication Failed";
        let alertMessage = result.error || "Please try again";

        if (result.authType === "passcode") {
          alertTitle = "Passcode Not Allowed";
          alertMessage = `Please use ${biometricType} instead of your device passcode to access the app.`;
        } else if (result.error?.includes("cancelled")) {
          alertTitle = "Authentication Cancelled";
          alertMessage = isRequired
            ? `You must use ${biometricType} to access the app. Please try again.`
            : "You can skip biometric authentication or try again.";
        } else if (newFailedAttempts >= 3) {
          alertTitle = "Multiple Failed Attempts";
          alertMessage = isRequired
            ? `${biometricType} authentication has failed ${newFailedAttempts} times. Please ensure your ${biometricType.toLowerCase()} is properly set up and try again.`
            : `${biometricType} authentication has failed ${newFailedAttempts} times. You can skip for now or try again.`;
        }

        setErrorTitle(alertTitle);
        setErrorMessage(alertMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      setErrorTitle("Error");
      setErrorMessage(
        "An unexpected error occurred during authentication. Please try again."
      );
      setShowErrorModal(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkip = async () => {
    if (!allowSkip || isRequired) return;

    try {
      await BiometricSettings.setBiometricSetting(false);

      if (onSkip) {
        onSkip();
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.TABS }],
          })
        );
      }
    } catch (error) {
      console.error("Error handling skip:", error);
      if (onSkip) {
        onSkip();
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.TABS }],
          })
        );
      }
    }
  };

  const handleErrorModalConfirm = () => {
    setShowErrorModal(false);
    setIsRetrying(true);
    setTimeout(() => handleBiometricAuth(), 500);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    if (!isRequired && allowSkip) {
      handleSkip();
    }
  };

  const getStatusText = () => {
    if (isAuthenticating) {
      return `Authenticating with ${biometricType}...`;
    }
    if (isRetrying) {
      return "Preparing authentication...";
    }
    if (failedAttempts > 0) {
      return `Authentication failed ${failedAttempts} time${
        failedAttempts > 1 ? "s" : ""
      }. Try again.`;
    }
    return `Use ${biometricType} to quickly and securely access your tasks`;
  };

  const getStatusColor = () => {
    if (failedAttempts > 0) {
      return theme.colors.error;
    }
    return theme.colors.text;
  };

  return (
    <>
      <Column
        justifyContent="center"
        alignItems="center"
        gap={20}
        style={[
          commonStyles.screenWrapper,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name={biometricIcon as any}
          size={120}
          color={themeColor?.dark ?? theme.colors.primary}
        />

        <Text style={[commonStyles.titleText, { textAlign: "center" }]}>
          🔐 Secure Access
        </Text>

        <Text
          style={[
            commonStyles.basicText,
            {
              textAlign: "center",
              color: getStatusColor(),
            },
          ]}
        >
          {getStatusText()}
        </Text>

        <Row style={commonStyles.fullWidth}>
          <CustomButton
            title={isRetrying ? "Preparing..." : `Use ${biometricType}`}
            onPress={handleBiometricAuth}
            loading={isAuthenticating || isRetrying}
            disabled={isRetrying}
            halfWidth
            rounded
          />
        </Row>

        {allowSkip && !isRequired && (
          <Pressable onPress={handleSkip} disabled={isAuthenticating}>
            <Text
              style={[
                commonStyles.smallText,
                {
                  textAlign: "center",
                  color: isAuthenticating
                    ? (theme.colors as any).disabled || theme.colors.text
                    : theme.colors.primary,
                  opacity: isAuthenticating ? 0.5 : 1,
                },
              ]}
            >
              Skip for now
            </Text>
          </Pressable>
        )}

        {failedAttempts > 0 && (
          <>
            <Spacer size={20} />
            <Text
              style={[
                commonStyles.tinyText,
                {
                  textAlign: "center",
                  color: theme.colors.error,
                },
              ]}
            >
              Having trouble? Make sure your {biometricType.toLowerCase()} is
              properly set up in device settings.
            </Text>
          </>
        )}

        {isRequired && (
          <>
            <Spacer size={30} />
            <Text
              style={[
                commonStyles.smallText,
                {
                  textAlign: "center",
                  color: theme.colors.primary,
                  fontWeight: "bold",
                },
              ]}
            >
              🔒 {biometricType} authentication is required to access the app
            </Text>
          </>
        )}
      </Column>

      <AlertModal
        isVisible={showErrorModal}
        onClose={handleErrorModalClose}
        onConfirm={handleErrorModalConfirm}
        title={errorTitle}
        subTitle={errorMessage}
        error={true}
        loading={false}
      />
    </>
  );
}
