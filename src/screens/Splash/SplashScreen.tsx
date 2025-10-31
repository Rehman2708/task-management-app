import { ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Column } from "../../tools";
import Logo from "../../components/logo";
import { useCommonStyles } from "../../styles/commonstyles";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { useTheme } from "../../infrastructure/theme";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { useHelper } from "../../utils/helper";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SplashScreen = () => {
  const { handleNotificationNavigation } = useHelper();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuthStore();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  // Notifications Setup
  useEffect(() => {
    let isReady = false;

    const timer = setTimeout(() => {
      isReady = true;
    }, 500);

    const subscription = Notifications.addNotificationReceivedListener(
      () => {}
    );
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notData = response?.notification?.request?.content?.data;
        if (isReady) handleNotificationNavigation(notData);
        else setTimeout(() => handleNotificationNavigation(notData), 500);
      });

    return () => {
      clearTimeout(timer);
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

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
