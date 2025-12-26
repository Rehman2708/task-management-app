import { Text } from "react-native";
import { useRegisterViewModel } from "./registerViewModel";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../../components/customInput";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Spacer } from "../../tools";
import CustomButton from "../../components/customButton";
import { ROUTES } from "../../enums/routes";
import Logo from "../../components/logo";
import AuthBgContainer from "../../components/videoContainer";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../infrastructure/theme";

export const RegisterScreen = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    partnerUserId,
    setPartnerUserId,
    otp,
    setOtp,
    loading,
    otpLoading,
    error,
    otpSent,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP,
    setIsValidPassword,
    isValidPassword,
  } = useRegisterViewModel();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const handleSendOTP = async () => {
    try {
      await sendOTP();
    } catch (err) {}
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTPAndRegister();
    } catch (err) {}
  };

  const { navigate }: { navigate: any } = useNavigation();
  const Login = () => navigate(ROUTES.LOGIN);

  return (
    <AuthBgContainer>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          commonStyles.screenWrapper,
          { justifyContent: "center" },
        ]}
      >
        <Logo height={150} />
        <Text style={commonStyles.titleText}>📝 Register</Text>
        <Spacer size={20} />

        {!otpSent ? (
          <>
            <CustomInput title="👤 Name" value={name} onChangeText={setName} />
            <CustomInput
              title="📧 Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CustomInput
              title="🔒 Password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              onValidate={setIsValidPassword}
            />
            <CustomInput
              title="👥 Partner User ID (Optional)"
              value={partnerUserId}
              onChangeText={setPartnerUserId}
            />

            {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

            <CustomButton
              title="📱 Send OTP"
              onPress={handleSendOTP}
              loading={otpLoading}
              disabled={!isValidPassword}
            />
          </>
        ) : (
          <>
            <Text
              style={[
                commonStyles.basicText,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              📱 We've sent a 6-digit OTP to {email}
            </Text>

            <CustomInput
              title="🔢 Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />

            {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

            <CustomButton
              title="✅ Verify & Register"
              onPress={handleVerifyOTP}
              loading={loading}
            />

            <CustomButton
              customStyle={{
                borderWidth: 0,
                height: 30,
              }}
              title="🔄 Resend OTP"
              onPress={resendOTP}
              outlined
              loading={otpLoading}
            />
          </>
        )}

        <CustomButton
          customStyle={{
            borderWidth: 0,
            height: 30,
          }}
          title="🔐 Login"
          onPress={Login}
          outlined
        />
      </KeyboardAwareScrollView>
    </AuthBgContainer>
  );
};
