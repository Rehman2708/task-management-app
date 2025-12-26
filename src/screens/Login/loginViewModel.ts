import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { registerForPushNotificationsAsync } from "../../../notification";
import * as Device from "expo-device";
import { useAuthStore } from "../../store/authStore";

export function useLoginViewModel() {
  const { updateUser } = useAuthStore();
  const [identifier, setIdentifier] = useState(""); // email or userId
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation: any = useNavigation();
  const loginUser = async () => {
    if (!identifier || !password) {
      setError("Please enter both Email/User ID and Password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const notToken = await registerForPushNotificationsAsync();

      const payload = Device.isDevice
        ? {
            identifier: identifier.trim(),
            password,
            notificationToken: notToken,
          }
        : {
            identifier: identifier.trim(),
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
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    error,
    loginUser,
    Register,
  };
}
