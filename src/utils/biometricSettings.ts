import { Platform, Alert } from "react-native";
import { BiometricAuth, BiometricCapability } from "./biometricAuth";
import {
  getDataFromAsyncStorage,
  storeDataInAsyncStorage,
} from "./localstorage";
import { LocalStorageKey } from "../enums/localstorage";

export class BiometricSettings {
  static async getBiometricSetting(): Promise<boolean | null> {
    try {
      const { data } = await getDataFromAsyncStorage(
        LocalStorageKey.BIOMETRIC_ENABLED
      );
      return data as boolean | null;
    } catch (error) {
      console.error("Error getting biometric setting:", error);
      return null;
    }
  }

  static async setBiometricSetting(enabled: boolean): Promise<void> {
    try {
      await storeDataInAsyncStorage(LocalStorageKey.BIOMETRIC_ENABLED, enabled);
      BiometricAuth.clearCache();
    } catch (error) {
      console.error("Error setting biometric setting:", error);
      throw error;
    }
  }

  static async toggleBiometricAuth(): Promise<void> {
    try {
      const capabilities = await BiometricAuth.getCapabilities(true);

      if (!capabilities.hasHardware) {
        Alert.alert(
          "Not Supported",
          "This device doesn't support biometric authentication.",
          [{ text: "OK" }]
        );
        return;
      }

      if (!capabilities.isEnrolled) {
        Alert.alert(
          `${capabilities.primaryType} Not Set Up`,
          `No ${capabilities.primaryType.toLowerCase()} data is enrolled on this device. Please set up ${capabilities.primaryType.toLowerCase()} in your device settings first.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Setup Instructions",
              onPress: () => {
                Alert.alert(
                  "Setup Instructions",
                  `To set up ${capabilities.primaryType}:\n\n1. Go to your device Settings\n2. Find Security or ${capabilities.primaryType} settings\n3. Follow the setup instructions\n4. Return to this app and try again`,
                  [{ text: "Got it" }]
                );
              },
            },
          ]
        );
        return;
      }

      const currentSetting = await this.getBiometricSetting();
      const biometricType = capabilities.primaryType;

      if (currentSetting) {
        Alert.alert(
          `Disable ${biometricType}`,
          `Are you sure you want to disable ${biometricType} authentication?\n\nYou will need to enter your credentials each time you open the app.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                try {
                  await this.setBiometricSetting(false);
                  Alert.alert(
                    "Disabled",
                    `${biometricType} authentication has been disabled.`,
                    [{ text: "OK" }]
                  );
                } catch (error) {
                  Alert.alert(
                    "Error",
                    "Failed to disable biometric authentication. Please try again.",
                    [{ text: "OK" }]
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          `Enable ${biometricType}`,
          `Would you like to enable ${biometricType} authentication for faster and more secure access?\n\nYou can disable this anytime in your profile settings.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: `Enable ${biometricType}`,
              onPress: async () => {
                try {
                  const result = await BiometricAuth.authenticate(
                    `Use ${biometricType} to enable secure login`,
                    false
                  );

                  if (result.success) {
                    await this.setBiometricSetting(true);
                    Alert.alert(
                      "Enabled",
                      `${biometricType} authentication has been enabled successfully!`,
                      [{ text: "Great!" }]
                    );
                  } else {
                    let errorTitle = "Authentication Failed";
                    let errorMessage =
                      result.error ||
                      "Could not enable biometric authentication.";

                    if (result.authType === "passcode") {
                      errorTitle = "Passcode Used";
                      errorMessage = `You used your device passcode instead of ${biometricType}. Please try again and use ${biometricType} to enable this feature.`;
                    }

                    Alert.alert(errorTitle, errorMessage, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Try Again",
                        onPress: () => this.toggleBiometricAuth(),
                      },
                    ]);
                  }
                } catch (error) {
                  console.error("Error enabling biometric auth:", error);
                  Alert.alert(
                    "Error",
                    "An unexpected error occurred. Please try again.",
                    [{ text: "OK" }]
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error toggling biometric auth:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating biometric settings. Please try again.",
        [{ text: "OK" }]
      );
    }
  }

  static async getBiometricDisplayText(
    forceRefresh: boolean = false
  ): Promise<string> {
    try {
      const capabilities = await BiometricAuth.getCapabilities(forceRefresh);

      if (!capabilities.hasHardware) {
        return "🔐 Biometric Auth (Not Supported)";
      }

      if (!capabilities.isEnrolled) {
        return `🔐 ${capabilities.primaryType} (Not Set Up)`;
      }

      const currentSetting = await this.getBiometricSetting();
      const biometricType = capabilities.primaryType;

      let emoji = "🔐";
      switch (biometricType.toLowerCase()) {
        case "face id":
        case "face recognition":
          emoji = "🔐";
          break;
        case "touch id":
        case "fingerprint":
          emoji = "👆";
          break;
        case "iris recognition":
          emoji = "👁️";
          break;
      }

      const status = currentSetting ? "Enabled" : "Disabled";
      return `${emoji} ${biometricType} (${status})`;
    } catch (error) {
      console.error("Error getting biometric display text:", error);
      return "🔐 Biometric Auth";
    }
  }

  static async shouldPromptBiometric(): Promise<{
    shouldPrompt: boolean;
    isFirstTime: boolean;
    capabilities: BiometricCapability;
  }> {
    try {
      const capabilities = await BiometricAuth.getCapabilities();
      const currentSetting = await this.getBiometricSetting();

      return {
        shouldPrompt: capabilities.isAvailable && currentSetting === true,
        isFirstTime: capabilities.isAvailable && currentSetting === null,
        capabilities,
      };
    } catch (error) {
      console.error("Error checking biometric prompt status:", error);
      return {
        shouldPrompt: false,
        isFirstTime: false,
        capabilities: {
          isAvailable: false,
          hasHardware: false,
          isEnrolled: false,
          supportedTypes: [],
          primaryType: "None",
          securityLevel: 0,
        },
      };
    }
  }
}
