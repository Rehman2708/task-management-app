import { useEffect, useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import {
  getDataFromAsyncStorage,
  storeDataInAsyncStorage,
} from "../../utils/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { LocalStorageKey } from "../../enums/localstorage";

export function useLoginViewModel() {
  const [gettingUser, setGettingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const loginUser = async () => {
    if (!userId || !password) {
      setError("Please enter both User ID and Password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await AuthRepo.login({ userId, password });

      if (response?.user) {
        await storeDataInAsyncStorage(LocalStorageKey.USER, response.user);
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
  // Check if user already logged in
  useEffect(() => {
    (async () => {
      setGettingUser(true);
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
      }
      setGettingUser(false);
    })();
  }, []);
  return {
    userId,
    setUserId,
    password,
    setPassword,
    loading,
    error,
    loginUser,
    Register,
    gettingUser,
  };
}
