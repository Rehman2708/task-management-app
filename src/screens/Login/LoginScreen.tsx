import { useEffect } from "react";
import { Text } from "react-native";
import { useLoginViewModel } from "./loginViewModel";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { commonStyles } from "../../styles/commonstyles";
import { Column, Spacer } from "../../tools";
import { ROUTES } from "../../enums/routes";
import { LocalStorageKey } from "../../enums/localstorage";
import Logo from "../../components/logo";
import AuthBgContainer from "../../components/videoContainer";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const LoginScreen = () => {
  const {
    userId,
    setUserId,
    password,
    setPassword,
    loading,
    error,
    loginUser,
    Register,
    gettingUser,
  } = useLoginViewModel();

  const navigation = useNavigation();
  const handleLogin = async () => {
    try {
      await loginUser();
    } catch (err) {}
  };

  return (
    <AuthBgContainer>
      <Spacer size={100} />
      <Column style={commonStyles.screenWrapper} justifyContent="center">
        <Logo />
        {!gettingUser && (
          <>
            <Text style={commonStyles.titleText}>Login</Text>
            <Spacer size={20} />
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
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

              {error ? (
                <Text style={commonStyles.errorText}>{error}</Text>
              ) : null}

              <CustomButton
                title="Login"
                onPress={handleLogin}
                loading={loading}
              />
              <CustomButton title="Register" outlined onPress={Register} />
            </KeyboardAwareScrollView>
          </>
        )}
      </Column>
    </AuthBgContainer>
  );
};
