import { Text } from "react-native";
import { useRegisterViewModel } from "./registerViewModel";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../../components/customInput";
import { commonStyles } from "../../styles/commonstyles";
import { Column, Spacer } from "../../tools";
import CustomButton from "../../components/customButton";
import { ROUTES } from "../../enums/routes";
import Logo from "../../components/logo";
import AuthBgContainer from "../../components/videoContainer";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const RegisterScreen = () => {
  const {
    name,
    setName,
    userId,
    setUserId,
    password,
    setPassword,
    partnerUserId,
    setPartnerUserId,
    loading,
    error,
    registerUser,
  } = useRegisterViewModel();

  const handleRegister = async () => {
    try {
      await registerUser();
    } catch (err) {}
  };
  const { navigate } = useNavigation();
  const Login = () => navigate(ROUTES.LOGIN);
  return (
    <AuthBgContainer>
      <Column style={commonStyles.screenWrapper} justifyContent="center">
        <Logo />
        <Text style={commonStyles.titleText}>Register</Text>
        <Spacer size={20} />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: 540 }}
        >
          <CustomInput title="Name" value={name} onChangeText={setName} />
          <CustomInput
            title="User ID"
            value={userId}
            onChangeText={setUserId}
          />
          <CustomInput
            title="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <CustomInput
            title="Partner User ID (Optional)"
            value={partnerUserId}
            onChangeText={setPartnerUserId}
          />

          {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

          <CustomButton
            title="Register"
            onPress={handleRegister}
            loading={loading}
          />
          <CustomButton title="Login" onPress={Login} outlined />
        </KeyboardAwareScrollView>
      </Column>
    </AuthBgContainer>
  );
};
