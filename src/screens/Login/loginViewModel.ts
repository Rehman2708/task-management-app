import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { registerForPushNotificationsAsync } from "../../../notification";
import * as Device from "expo-device";
import { useAuthStore } from "../../store/authStore";

export function useLoginViewModel() {
  const { updateUser } = useAuthStore();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation: any = useNavigation();
  const loginUser = async () => {
    if (!userId || !password) {
      setError("Please enter both User ID and Password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const notToken = await registerForPushNotificationsAsync();

      const payload = Device.isDevice
        ? {
            userId: userId.trim(),
            password,
            notificationToken: notToken,
          }
        : {
            userId: userId.trim(),
            password,
          };
      const response = await AuthRepo.login(payload);

      if (response?.user) {
        updateUser(response.user);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.TABS }],
          })
        );
      }

      return response;
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const Register = () => navigation.navigate(ROUTES.REGISTER);

  return {
    userId,
    setUserId,
    password,
    setPassword,
    loading,
    error,
    loginUser,
    Register,
  };
}
