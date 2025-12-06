import { useEffect, useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { IUser } from "../../types/auth";
import * as Device from "expo-device";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/authStore";

export function useProfileViewModel() {
  const { updateUser, user, logout: storeLogout } = useAuthStore();
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
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
  const changeFontScreen = () => navigation.navigate(ROUTES.FONT);

  const createVideoScreen = () => navigation.navigate(ROUTES.CREATE_VIDEO);
  const resetPasswordScreen = () => navigation.navigate(ROUTES.RESET_PASSWORD);
  const updateProfileScreen = () => navigation.navigate(ROUTES.UPDATE_PROFILE);

  function startCountdown(
    targetDate: Date | string,
    callback: (text: string) => void
  ) {
    function update() {
      const now: Date = new Date();
      const endDate: Date = new Date(targetDate);

      const diffMs = Number(endDate) - Number(now);
      if (diffMs <= 0) {
        callback("Date has already passed");
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const seconds = totalSeconds % 60;

      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;

      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;

      const totalDays = Math.floor(totalHours / 24);

      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;

      const output = `${months} month ${days} day ${hours}h ${minutes}m ${seconds}s left. i.e ${totalDays} days`;
      callback(output);
    }

    update();
    return setInterval(update, 1000);
  }
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = startCountdown("2026-04-27T00:00:00+05:30", setTimeLeft);

    return () => clearInterval(timer); // cleanup
  }, []);
  function getTimeLeft() {
    return `${timeLeft}`;
  }

  const partnerId = user?.partner?.userId;
  const partnerImage = user?.partner?.image;

  const fetchUserDetails = async () => {
    try {
      setLoadingUserDetail(true);
      if (user?.userId) {
        const data = await AuthRepo.getUserDetails(user.userId);
        if (data?.user) {
          updateUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  return {
    user,
    loading,
    partnerId,
    addPartner,
    logout,
    changeThemeScreen,
    changeFontScreen,
    createVideoScreen,
    updateProfileScreen,
    loggingOut,
    getTimeLeft,
    partnerInput,
    setPartnerInput,
    partnerImage,
    loadingUserDetail,
    fetchUserDetails,
    resetPasswordScreen,
  };
}
