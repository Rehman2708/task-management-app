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
import { IUser } from "../../types/auth";

const SplashScreen = () => {
  const { themeColor } = useHelper();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuthStore();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

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
      updateUser(user as IUser);
      fetchUserDetails(user?.userId!);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: success && user ? ROUTES.TABS : ROUTES.LOGIN }],
        })
      );
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
      {!loading && <ActivityIndicator size="large" color={themeColor.dark} />}
    </Column>
  );
};

export default SplashScreen;
