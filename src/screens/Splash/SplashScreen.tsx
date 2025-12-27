import { ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { Column } from "../../tools";
import Logo from "../../components/logo";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";
import { useHelper } from "../../utils/helper";
import BiometricAuthModal from "../../components/BiometricAuthModal";
import { useSplashViewModel } from "./splashViewModel";

const SplashScreen = () => {
  const { themeColor } = useHelper();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const {
    // States
    loading,
    showBiometricModal,
    biometricRequired,
    allowSkipBiometric,

    // Actions
    initializeApp,
    handleBiometricSuccess,
    handleBiometricSkip,
  } = useSplashViewModel();

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <>
      <Column
        style={[
          commonStyles.fullFlex,
          { backgroundColor: theme.colors.background },
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Logo />
        {loading && <ActivityIndicator size="large" color={themeColor.dark} />}
      </Column>

      <BiometricAuthModal
        isVisible={showBiometricModal}
        onSuccess={handleBiometricSuccess}
        onSkip={allowSkipBiometric ? handleBiometricSkip : undefined}
        allowSkip={allowSkipBiometric}
        isRequired={biometricRequired}
        title="🔐 Secure Access"
        subtitle="Use biometric authentication to quickly and securely access your tasks"
      />
    </>
  );
};

export default SplashScreen;
