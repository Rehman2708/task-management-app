import { Text } from "react-native";
import { useLoginViewModel } from "./loginViewModel";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useCommonStyles } from "../../styles/commonstyles";
import { Spacer } from "../../tools";
import Logo from "../../components/logo";
import AuthBgContainer from "../../components/videoContainer";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../infrastructure/theme";

export const LoginScreen = () => {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    error,
    loginUser,
    Register,
  } = useLoginViewModel();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const handleLogin = async () => {
    try {
      await loginUser();
    } catch (err) {}
  };

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
        <>
          <Text style={commonStyles.titleText}>🔐 Login</Text>
          <Spacer size={20} />
          <CustomInput
            title="📧 Email or User ID"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <CustomInput
            title="🔒 Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />

          {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

          <CustomButton
            title="🚀 Login"
            onPress={handleLogin}
            loading={loading}
          />
          <CustomButton
            customStyle={{
              borderWidth: 0,
              height: 30,
            }}
            title="📝 Register"
            outlined
            onPress={Register}
          />
        </>
      </KeyboardAwareScrollView>
    </AuthBgContainer>
  );
};
