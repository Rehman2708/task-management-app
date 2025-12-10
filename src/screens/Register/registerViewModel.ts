import { useState } from "react";
import { AuthRepo } from "../../repositories/auth";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { useAuthStore } from "../../store/authStore";
import { registerForPushNotificationsAsync } from "../../../notification";
import * as Device from "expo-device";

export function useRegisterViewModel() {
  const { updateUser } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerUserId, setPartnerUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigation = useNavigation();

  const sendOTP = async () => {
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (!isValidPassword) {
      setError("Please enter a valid password");
      return;
    }

    setOtpLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        partnerUserId: partnerUserId.trim() || undefined,
      };

      const response = await AuthRepo.sendOTP(payload);
      if (response?.message) {
        setOtpSent(true);
        setError("");
      }

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
      throw err;
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTPAndRegister = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const notToken = await registerForPushNotificationsAsync();

      const payload = Device.isDevice
        ? {
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            notificationToken: notToken,
          }
        : {
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          };

      const response = await AuthRepo.verifyOTP(payload);
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
      setError(err?.message || "Invalid OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtp("");
    setOtpSent(false);
    await sendOTP();
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    partnerUserId,
    setPartnerUserId,
    otp,
    setOtp,
    loading,
    otpLoading,
    error,
    otpSent,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP,
    setIsValidPassword,
    isValidPassword,
  };
}
