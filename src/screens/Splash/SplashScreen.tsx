import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Column } from "../../tools";
import Logo from "../../components/logo";
import { commonStyles } from "../../styles/commonstyles";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";

const SplashScreen = () => {
  const navigation = useNavigation();
  // Check if user already logged in
  useEffect(() => {
    (async () => {
      const { data: user, success } = await getDataFromAsyncStorage(
        LocalStorageKey.USER
      );
      if (success && user) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.TABS }],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          })
        );
      }
    })();
  }, []);
  return (
    <Column
      style={commonStyles.fullFlex}
      justifyContent="center"
      alignItems="center"
    >
      <Logo />
    </Column>
  );
};

export default SplashScreen;
