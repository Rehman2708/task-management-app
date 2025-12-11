import React, { useState } from "react";
import { View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { useNavigation } from "@react-navigation/native";
import ToastService from "../../utils/toastService";

const ResetPasswordScreen = () => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const { user, updateUser } = useAuthStore();
  const navigation: any = useNavigation();
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetPassword = async () => {
    if (!form.oldPassword || !form.newPassword) {
      ToastService.error({
        title: "Missing Information",
        message: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      if (!user) return;
      const response = await AuthRepo.updatePassword({
        userId: user.userId,
        ...form,
      });
      if (response.user) {
        updateUser(response.user);
        ToastService.success({
          title: "Password updated",
          message: "Password updated successfully!",
        });
        navigation.goBack();
      }
    } catch (err: any) {
      ToastService.error({
        title: "Error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper hideNotificationButton showBackbutton title="Reset Password">
      <CustomInput
        title="Current Password"
        value={form.oldPassword}
        secureTextEntry
        onChangeText={(value) => handleChange("oldPassword", value)}
      />
      <CustomInput
        title="New Password"
        value={form.newPassword}
        secureTextEntry
        onChangeText={(value) => handleChange("newPassword", value)}
        onValidate={setIsValidPassword}
      />
      <View style={{ flex: 1 }} />
      <CustomButton
        title="Reset"
        onPress={resetPassword}
        loading={loading}
        disabled={!isValidPassword}
      />
    </ScreenWrapper>
  );
};

export default ResetPasswordScreen;
