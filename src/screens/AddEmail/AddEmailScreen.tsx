import React, { useState } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useCommonStyles } from "../../styles/commonstyles";
import { Spacer } from "../../tools";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useTheme } from "../../infrastructure/theme";
import { AuthRepo } from "../../repositories/auth";
import { useAuthStore } from "../../store/authStore";

export const AddEmailScreen = () => {
  const { user, updateUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const navigation = useNavigation();

  const handleAddEmail = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!user?.userId) {
      setError("User not found");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await AuthRepo.addEmail({
        userId: user.userId,
        email: email.trim().toLowerCase(),
      });

      if (response?.user) {
        updateUser(response.user);
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper title="Add Email" showBackbutton>
      <CustomInput
        title="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Enter your email"
      />

      {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}
      <View style={commonStyles.fullFlex} />
      <CustomButton
        title="Add Email"
        onPress={handleAddEmail}
        loading={loading}
      />
    </ScreenWrapper>
  );
};
