import { useEffect, useState } from "react";
import { Text, Modal, BackHandler } from "react-native";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";
import { Column, Spacer } from "../tools";
import { Ionicons } from "@expo/vector-icons";
import { BiometricAuth } from "../utils/biometricAuth";
import { useHelper } from "../utils/helper";
import { BiometricSettings } from "../utils/biometricSettings";
import CustomButton from "./customButton";

interface BiometricAuthModalProps {
  isVisible: boolean;
  onSuccess: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
  isRequired?: boolean;
  title?: string;
  subtitle?: string;
}

export default function BiometricAuthModal({
  isVisible,
  onSuccess,
  onSkip,
  allowSkip = true,
  isRequired = false,
  title = "🔐 Secure Access",
  subtitle,
}: BiometricAuthModalProps) {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { themeColor } = useHelper();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [biometricIcon, setBiometricIcon] = useState<string>(
    "shield-checkmark-outline"
  );
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isVisible) {
      initializeBiometricInfo();
      setFailedAttempts(0);
      setHasError(false);
      setErrorMessage("");
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const onBackPress = () => {
      if (allowSkip && !isRequired && onSkip) {
        onSkip();
      }
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [isVisible, allowSkip, isRequired, onSkip]);

  const initializeBiometricInfo = async () => {
    try {
      const capabilities = await BiometricAuth.getCapabilities();

      // Check if biometric authentication is available
      if (!capabilities.hasHardware) {
        setHasError(true);
        setErrorMessage(
          "This device doesn't support biometric authentication."
        );
        return;
      }

      if (!capabilities.isEnrolled) {
        setHasError(true);
        setErrorMessage(
          `No ${capabilities.primaryType.toLowerCase()} data is enrolled on this device. Please set up ${capabilities.primaryType.toLowerCase()} in your device settings first.\n\nTo set up ${
            capabilities.primaryType
          }:\n1. Go to your device Settings\n2. Find Security or ${
            capabilities.primaryType
          } settings\n3. Follow the setup instructions\n4. Return to this app and try again`
        );
        return;
      }

      setBiometricType(capabilities.primaryType);
      setBiometricIcon(
        BiometricAuth.getBiometricIcon(capabilities.primaryType)
      );

      // Auto-trigger authentication after a short delay
      setTimeout(() => {
        if (!isAuthenticating && isVisible) {
          handleBiometricAuth();
        }
      }, 1000);
    } catch (error) {
      console.error("Error initializing biometric info:", error);
      setBiometricType("Biometric");
      setBiometricIcon("shield-checkmark-outline");
      setHasError(true);
      setErrorMessage(
        "Failed to initialize biometric authentication. Please try again."
      );
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
        // Clear any previous errors
        setHasError(false);
        setErrorMessage("");
        onSuccess();
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        let errorMessage = result.error || "Authentication failed";

        // Handle specific error types based on the BiometricAuth utility
        switch (result.error) {
          case "Authentication was cancelled":
          case "UserCancel":
          case "user_cancel": // Handle the specific case mentioned by user
            errorMessage = isRequired
              ? `Authentication is required to access the app. Please use ${biometricType} to continue.`
              : `Authentication was cancelled. You can skip biometric authentication or try again.`;
            break;

          case "User chose to use device passcode":
          case "UserFallback":
          case "user_fallback":
            errorMessage = `You used your device passcode instead of ${biometricType}. Please try again using ${biometricType} for secure access.`;
            break;

          case "Authentication was cancelled by the system":
          case "SystemCancel":
          case "system_cancel":
            errorMessage =
              "Authentication was cancelled by the system. This may happen when the app goes to background. Please try again.";
            break;

          case `${biometricType} authentication failed. Please try again.`:
          case "AuthenticationFailed":
          case "authentication_failed":
            errorMessage = `${biometricType} was not recognized. Please position your ${
              biometricType === "Face ID"
                ? "face"
                : biometricType === "Touch ID" ||
                  biometricType === "Fingerprint"
                ? "finger"
                : "biometric"
            } correctly and try again.`;
            break;

          case `${biometricType} is temporarily unavailable`:
          case "BiometricUnavailable":
          case "biometric_unavailable":
            errorMessage = `${biometricType} is temporarily unavailable. This may be due to too many failed attempts. Please wait a moment and try again.`;
            break;

          case `No ${biometricType.toLowerCase()} enrolled. Please set up ${biometricType.toLowerCase()} in Settings.`:
          case `No ${biometricType.toLowerCase()} data is enrolled on this device. Please set up ${biometricType.toLowerCase()} in your device settings.`:
          case "NotEnrolled":
          case "not_enrolled":
            errorMessage = `No ${biometricType.toLowerCase()} data is enrolled on this device. Please set up ${biometricType.toLowerCase()} in your device settings first.\n\nTo set up ${biometricType}:\n1. Go to your device Settings\n2. Find Security or ${biometricType} settings\n3. Follow the setup instructions\n4. Return to this app and try again`;
            break;

          case "Device passcode is not set. Please set up a passcode in Settings.":
          case "PasscodeNotSet":
          case "passcode_not_set":
            errorMessage =
              "Your device passcode is not set. Please set up a passcode in your device settings first, then set up biometric authentication.";
            break;

          case "This device doesn't support biometric authentication":
          case "hardware_unavailable":
            errorMessage =
              "This device doesn't support biometric authentication. You can continue without biometric security.";
            break;

          case "An unexpected error occurred during authentication":
          case "unknown_error":
            errorMessage =
              "An unexpected error occurred during authentication. Please restart the app and try again.";
            break;

          // Lockout cases (too many failed attempts)
          case "biometric_lockout":
          case "BiometricLockout":
            errorMessage = `${biometricType} is locked due to too many failed attempts. Please wait 30 seconds or use your device passcode to unlock.`;
            break;

          // Permanent lockout cases
          case "biometric_lockout_permanent":
          case "BiometricLockoutPermanent":
            errorMessage = `${biometricType} is permanently locked due to too many failed attempts. Please use your device passcode and re-enroll your ${biometricType.toLowerCase()}.`;
            break;

          default:
            // Handle any other error patterns or unknown errors
            if (result.error?.toLowerCase().includes("cancel")) {
              errorMessage = isRequired
                ? `Authentication is required to access the app. Please use ${biometricType} to continue.`
                : `Authentication was cancelled. You can skip biometric authentication or try again.`;
            } else if (result.error?.toLowerCase().includes("failed")) {
              errorMessage = `${biometricType} authentication failed. Please ensure your ${biometricType.toLowerCase()} is properly set up and try again.`;
            } else if (result.error?.toLowerCase().includes("unavailable")) {
              errorMessage = `${biometricType} is currently unavailable. Please try again in a moment.`;
            } else if (result.error?.toLowerCase().includes("lockout")) {
              errorMessage = `${biometricType} is temporarily locked. Please wait a moment or use your device passcode.`;
            } else if (result.authType === "passcode") {
              errorMessage = `You used your device passcode instead of ${biometricType}. Please try again using ${biometricType} for secure access.`;
            } else if (newFailedAttempts >= 3) {
              errorMessage = isRequired
                ? `${biometricType} authentication has failed ${newFailedAttempts} times. Please ensure your ${biometricType.toLowerCase()} is properly set up and working correctly.`
                : `${biometricType} authentication has failed ${newFailedAttempts} times. You can skip for now or ensure your ${biometricType.toLowerCase()} is working properly.`;
            } else {
              errorMessage =
                result.error ||
                `${biometricType} authentication failed. Please try again.`;
            }
            break;
        }

        setErrorMessage(errorMessage);
        setHasError(true);
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      let errorMessage = "An unexpected error occurred during authentication.";

      if (error instanceof Error) {
        if (error.message.toLowerCase().includes("cancel")) {
          errorMessage = isRequired
            ? `Authentication is required to access the app. Please use ${biometricType} to continue.`
            : `Authentication was cancelled. You can skip biometric authentication or try again.`;
        } else if (error.message.toLowerCase().includes("unavailable")) {
          errorMessage = `${biometricType} is currently unavailable. Please try again in a moment.`;
        } else if (error.message.toLowerCase().includes("lockout")) {
          errorMessage = `${biometricType} is temporarily locked. Please wait a moment or use your device passcode.`;
        } else {
          errorMessage = `An unexpected error occurred: ${error.message}. Please try again.`;
        }
      }

      setErrorMessage(errorMessage);
      setHasError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkip = async () => {
    if (!allowSkip || isRequired || !onSkip) return;

    try {
      await BiometricSettings.setBiometricSetting(false);
      onSkip();
    } catch (error) {
      console.error("Error handling skip:", error);
      onSkip();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    setIsRetrying(true);
    setTimeout(() => handleBiometricAuth(), 500);
  };

  const getStatusText = () => {
    if (hasError && errorMessage) {
      return errorMessage;
    }
    if (isAuthenticating) {
      return `Authenticating with ${biometricType}...`;
    }
    if (isRetrying) {
      return "Preparing authentication...";
    }
    if (failedAttempts > 0) {
      if (failedAttempts === 1) {
        return `Authentication failed. Please try again.`;
      } else if (failedAttempts >= 3) {
        return `Authentication failed ${failedAttempts} times. Please ensure your ${biometricType.toLowerCase()} is properly set up.`;
      } else {
        return `Authentication failed ${failedAttempts} times. Try again.`;
      }
    }
    return (
      subtitle ||
      `Use ${biometricType} to quickly and securely access your tasks`
    );
  };

  const getStatusColor = () => {
    if (hasError || failedAttempts > 0) {
      return theme.colors.error;
    }
    return theme.colors.text;
  };

  const shouldShowOkButton = () => {
    return (
      hasError &&
      (errorMessage.includes("doesn't support") ||
        errorMessage.includes("not enrolled") ||
        errorMessage.includes("Failed to initialize") ||
        errorMessage.includes("Please set up a passcode") ||
        errorMessage.includes("permanently locked"))
    );
  };

  const shouldShowSkipButton = () => {
    return allowSkip && !isRequired && onSkip && !shouldShowOkButton();
  };

  if (!isVisible) return null;

  return (
    <>
      <Modal
        visible={true}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (allowSkip && !isRequired && onSkip) {
            onSkip();
          }
        }}
      >
        <Column
          justifyContent="center"
          alignItems="center"
          style={[
            commonStyles.screenWrapper,
            {
              zIndex: 10000,
            },
          ]}
        >
          <Column
            alignItems="center"
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 20,
              padding: 30,
              width: "90%",
              alignItems: "center",
            }}
          >
            <Column alignItems="center" gap={20}>
              <Ionicons
                name={biometricIcon as any}
                size={80}
                color={themeColor?.dark ?? theme.colors.primary}
              />

              <Text style={[commonStyles.titleText, { textAlign: "center" }]}>
                {title}
              </Text>

              <Text
                style={[
                  commonStyles.basicText,
                  { textAlign: "center", color: getStatusColor() },
                ]}
              >
                {getStatusText()}
              </Text>

              <Spacer size={10} />

              <Column gap={10} style={commonStyles.fullWidth}>
                {hasError ? (
                  <>
                    <CustomButton
                      title={shouldShowOkButton() ? "OK" : "Try Again"}
                      onPress={
                        shouldShowOkButton()
                          ? onSkip || (() => {})
                          : handleRetry
                      }
                      rounded
                      disabled={isAuthenticating || isRetrying}
                    />
                    {shouldShowSkipButton() && (
                      <CustomButton
                        title="Skip for now"
                        onPress={handleSkip}
                        outlined
                        rounded
                        disabled={isAuthenticating}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <CustomButton
                      title={
                        isAuthenticating
                          ? "Authenticating..."
                          : isRetrying
                          ? "Preparing..."
                          : `Use ${biometricType}`
                      }
                      onPress={handleBiometricAuth}
                      loading={isAuthenticating || isRetrying}
                      disabled={isAuthenticating || isRetrying}
                      rounded
                    />

                    {allowSkip && !isRequired && onSkip && (
                      <CustomButton
                        title="Skip for now"
                        onPress={handleSkip}
                        outlined
                        rounded
                        disabled={isAuthenticating}
                      />
                    )}
                  </>
                )}
              </Column>
            </Column>
          </Column>
        </Column>
      </Modal>
    </>
  );
}
