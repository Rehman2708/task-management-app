import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import {
  clearAsyncStorage,
  getDataFromAsyncStorage,
  storeDataInAsyncStorage,
} from "../../utils/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { IUser } from "../../types/auth";
import { LocalStorageKey } from "../../enums/localstorage";

export function useProfileViewModel() {
  const [user, setUser] = useState<IUser | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const stored = await getDataFromAsyncStorage<IUser>(LocalStorageKey.USER);
      if (stored.data) {
        setUser(stored.data);
        setPartnerId(stored?.data?.partner?.name || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPartner = async (partner: string) => {
    setLoading(true);
    try {
      if (!user) return;
      const response = await AuthRepo.connectPartner({
        userId: user.userId,
        partnerUserId: partner,
      });
      if (response.success) {
        const updatedUser = { ...user, partnerId: partner };
        setUser(updatedUser);
        setPartnerId(partner);
        await storeDataInAsyncStorage(LocalStorageKey.USER, updatedUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const navigation = useNavigation();
  const logout = async () => {
    setLoggingOut(true);
    try {
      if (user?.userId) {
        const response = await AuthRepo.logout(user?.userId);
        if (response.user) {
          await clearAsyncStorage();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: ROUTES.LOGIN }],
            })
          );
        }
      }
    } catch (error) {
      console.log("Something went wrong!");
    } finally {
      setLoggingOut(false);
    }
  };
  const changeThemeScreen = () => navigation.navigate(ROUTES.THEME);
  return {
    user,
    partnerId,
    loading,
    fetchUserDetails,
    addPartner,
    logout,
    changeThemeScreen,
    loggingOut,
  };
}
