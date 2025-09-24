import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Column } from "../../tools";
import Logo from "../../components/logo";
import { commonStyles } from "../../styles/commonstyles";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { theme } from "../../infrastructure/theme";
import { IUser } from "../../types/auth";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";

const SplashScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuthStore();
  // Check if user already logged in

  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true);
      if (id) {
        const data = await AuthRepo.getUserDetails(id);
        if (data?.user) {
          updateUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: user, success } = await getDataFromAsyncStorage(
        LocalStorageKey.USER
      );
      updateUser(user);
      fetchUserDetails(user?.userId!);
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
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
      justifyContent="center"
      alignItems="center"
    >
      <Logo />
      {loading && (
        <ActivityIndicator size={"large"} color={theme.colors.primary} />
      )}
    </Column>
  );
};

export default SplashScreen;
