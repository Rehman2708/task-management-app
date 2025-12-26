import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
  authType?: "biometric" | "passcode" | "none";
}

export interface BiometricCapability {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  primaryType: string;
  securityLevel: LocalAuthentication.SecurityLevel;
}

export class BiometricAuth {
  private static capabilityCache: BiometricCapability | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 30000;

  static async getCapabilities(
    forceRefresh: boolean = false
  ): Promise<BiometricCapability> {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.capabilityCache &&
      now - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      return this.capabilityCache;
    }

    try {
      const [hasHardware, isEnrolled, supportedTypes, securityLevel] =
        await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          LocalAuthentication.getEnrolledLevelAsync(),
        ]);

      const capability: BiometricCapability = {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
        primaryType: this.getBiometricTypeName(supportedTypes),
        securityLevel,
      };

      this.capabilityCache = capability;
      this.cacheTimestamp = now;
      return capability;
    } catch (error) {
      console.error("Error getting biometric capabilities:", error);
      const fallbackCapability: BiometricCapability = {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        primaryType: "None",
        securityLevel: LocalAuthentication.SecurityLevel.NONE,
      };

      this.capabilityCache = fallbackCapability;
      this.cacheTimestamp = now;
      return fallbackCapability;
    }
  }

  static async isAvailable(): Promise<boolean> {
    const capabilities = await this.getCapabilities();
    return capabilities.isAvailable;
  }

  static async getSupportedTypes(): Promise<
    LocalAuthentication.AuthenticationType[]
  > {
    const capabilities = await this.getCapabilities();
    return capabilities.supportedTypes;
  }

  static async authenticate(
    promptMessage: string = "Authenticate to access your tasks",
    allowDeviceFallback: boolean = true
  ): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.getCapabilities();

      if (!capabilities.hasHardware) {
        return {
          success: false,
          error: "This device doesn't support biometric authentication",
          authType: "none",
        };
      }

      if (!capabilities.isEnrolled) {
        return {
          success: false,
          error: `No ${capabilities.primaryType.toLowerCase()} data is enrolled on this device. Please set up ${capabilities.primaryType.toLowerCase()} in your device settings.`,
          authType: "none",
        };
      }

      const biometricType = capabilities.primaryType;
      const customPromptMessage = promptMessage.includes("Authenticate")
        ? promptMessage.replace("Authenticate", `Use ${biometricType}`)
        : promptMessage;

      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: customPromptMessage,
        cancelLabel: "Cancel",
        disableDeviceFallback: !allowDeviceFallback,
        requireConfirmation: false,
      };

      if (Platform.OS === "ios") {
        authOptions.fallbackLabel = allowDeviceFallback
          ? "Use Passcode"
          : undefined;
      }

      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        return {
          success: true,
          biometricType,
          authType: "biometric",
        };
      } else {
        let errorMessage = "Authentication failed";
        let authType: "biometric" | "passcode" | "none" = "none";

        switch (result.error) {
          case "UserCancel":
            errorMessage = "Authentication was cancelled";
            break;
          case "UserFallback":
            errorMessage = "User chose to use device passcode";
            authType = "passcode";
            break;
          case "SystemCancel":
            errorMessage = "Authentication was cancelled by the system";
            break;
          case "AuthenticationFailed":
            errorMessage = `${biometricType} authentication failed. Please try again.`;
            break;
          case "BiometricUnavailable":
            errorMessage = `${biometricType} is temporarily unavailable`;
            break;
          case "NotEnrolled":
            errorMessage = `No ${biometricType.toLowerCase()} enrolled. Please set up ${biometricType.toLowerCase()} in Settings.`;
            break;
          case "PasscodeNotSet":
            errorMessage =
              "Device passcode is not set. Please set up a passcode in Settings.";
            break;
          default:
            errorMessage = result.error || "Authentication failed";
        }

        return {
          success: false,
          error: errorMessage,
          biometricType,
          authType,
        };
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during authentication",
        authType: "none",
      };
    }
  }

  static getBiometricTypeName(
    types: LocalAuthentication.AuthenticationType[]
  ): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris Recognition";
    }
    if (types.length > 0) {
      return "Biometric Authentication";
    }
    return "None";
  }

  static getBiometricIcon(biometricType?: string): string {
    if (!biometricType) return "shield-checkmark-outline";

    switch (biometricType.toLowerCase()) {
      case "face id":
      case "face recognition":
        return "scan-outline";
      case "touch id":
      case "fingerprint":
        return "finger-print-outline";
      case "iris recognition":
        return "eye-outline";
      default:
        return "shield-checkmark-outline";
    }
  }

  static async showEnableBiometricAlert(
    onEnable: () => void,
    onSkip: () => void
  ): Promise<void> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.isAvailable) {
      onSkip();
      return;
    }

    const biometricType = capabilities.primaryType;
    const icon =
      biometricType === "Face ID"
        ? "🔐"
        : biometricType === "Touch ID" || biometricType === "Fingerprint"
        ? "👆"
        : biometricType === "Iris Recognition"
        ? "👁️"
        : "🔐";

    const { Alert } = require("react-native");
    Alert.alert(
      `${icon} Enable ${biometricType}`,
      `Would you like to use ${biometricType} for faster and more secure access to your tasks?\n\nYou can always change this later in your profile settings.`,
      [
        {
          text: "Skip",
          style: "cancel",
          onPress: onSkip,
        },
        {
          text: `Enable ${biometricType}`,
          onPress: onEnable,
        },
      ]
    );
  }

  static clearCache(): void {
    this.capabilityCache = null;
    this.cacheTimestamp = 0;
  }

  static async supportsAuthentication(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      return hasHardware;
    } catch (error) {
      console.error("Error checking authentication support:", error);
      return false;
    }
  }
}
