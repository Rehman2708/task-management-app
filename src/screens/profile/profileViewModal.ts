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
import * as Device from "expo-device";
import { Alert } from "react-native";

export function useProfileViewModel() {
  const [user, setUser] = useState<IUser | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [partnerInput, setPartnerInput] = useState("");
  const [userImage, setUserImage] = useState(user?.image ?? "");
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const stored = await getDataFromAsyncStorage<IUser>(LocalStorageKey.USER);
      if (stored.data) {
        const data = await AuthRepo.getUserDetails(stored.data?.userId);
        if (data?.user) {
          setUser(data.user);
          setUserImage(data.user?.image ?? "");
          setPartnerId(data.user.partner?.name || null);
        }
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
  const navigation: any = useNavigation();
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (user?.userId) {
        if (Device.isDevice) {
          await AuthRepo.logout(user?.userId);
        }
        await clearAsyncStorage();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          })
        );
      }
    } catch (error) {
      console.log("Something went wrong!");
    } finally {
      setLoggingOut(false);
    }
  };
  const logout = (taskId: string) => {
    Alert.alert("Logout", "Are you sure you want to Logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };
  const changeThemeScreen = () => navigation.navigate(ROUTES.THEME);

  function getTimeLeft(targetDate = "2026-04-27") {
    const now = new Date();
    const endDate = new Date(targetDate);

    // Total difference in milliseconds
    const diffMs = endDate - now;

    if (diffMs <= 0) return "Date has already passed";

    // Convert total milliseconds to total days
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Approximate months and remaining days
    const months = Math.floor(totalDays / 30); // approximate month as 30 days
    const days = totalDays % 30;

    return `${months} month ${days} day left, i.e: ${totalDays} days`;
  }

  const updateProfilePicture = async (image: string) => {
    try {
      setUserImage(image);
      if (user?.userId) {
        await AuthRepo.updateProfile({
          userId: user?.userId,
          image,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    user,
    partnerId,
    loading,
    fetchUserDetails,
    addPartner,
    logout,
    changeThemeScreen,
    loggingOut,
    userImage,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    updateProfilePicture,
  };
}
