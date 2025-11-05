import React, { useState } from "react";
import { View, Alert } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";
import { useNavigation } from "@react-navigation/native";

const ResetPasswordScreen = () => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuthStore();
  const navigation: any = useNavigation();
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetPassword = async () => {
    if (!form.oldPassword || !form.newPassword) {
      Alert.alert("Missing Information", "Please fill in all fields.");
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
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setForm({ oldPassword: "", newPassword: "" });
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
      />
      <View style={{ flex: 1 }} />
      <CustomButton title="Reset" onPress={resetPassword} loading={loading} />
    </ScreenWrapper>
  );
};

export default ResetPasswordScreen;
