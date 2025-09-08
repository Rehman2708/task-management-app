import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { storeDataInAsyncStorage } from "../../utils/localstorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { LocalStorageKey } from "../../enums/localstorage";

interface RegisterPayload {
  name: string;
  userId: string;
  password: string;
  partnerUserId?: string;
}

export function useRegisterViewModel() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [partnerUserId, setPartnerUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const registerUser = async () => {
    if (!name || !userId || !password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload: RegisterPayload = {
        name: name.trim(),
        userId: userId.trim(),
        password,
      };
      if (partnerUserId) payload.partnerUserId = partnerUserId.trim();

      const response = await AuthRepo.register(payload);
      if (response?.user) {
        await storeDataInAsyncStorage(LocalStorageKey.USER, response.user);
      }
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.TABS }],
        })
      );

      return response;
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    userId,
    setUserId,
    password,
    setPassword,
    partnerUserId,
    setPartnerUserId,
    loading,
    error,
    registerUser,
  };
}
