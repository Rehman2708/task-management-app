import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { IUser } from "../../types/auth";
import * as Device from "expo-device";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";

export function useProfileViewModel() {
  const { updateUser, user, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [partnerInput, setPartnerInput] = useState("");

  const addPartner = async (partner: string) => {
    setLoading(true);
    try {
      if (!user) return;
      const response = await AuthRepo.connectPartner({
        userId: user.userId,
        partnerUserId: partner,
      });
      if (response.success) {
        updateUser(response.user);
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
        await storeLogout();
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
  const logout = () => {
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
  const createVideoScreen = () => navigation.navigate(ROUTES.CREATE_VIDEO);
  const updateProfileScreen = () => navigation.navigate(ROUTES.UPDATE_PROFILE);
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
  const partnerId = user?.partner?.userId;
  const partnerImage = user?.partner?.image;
  return {
    user,
    loading,
    partnerId,
    addPartner,
    logout,
    changeThemeScreen,
    createVideoScreen,
    updateProfileScreen,
    loggingOut,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    partnerImage,
  };
}
