import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "../../infrastructure/theme";
import { useProfileViewModel } from "./profileViewModal";
import ScreenWrapper from "../../components/ScreenWrapper";
import { commonStyles } from "../../styles/commonstyles";
import { Column, isAndroid, Row, Spacer } from "../../tools";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import { useHelper } from "../../utils/helper";

export default function ProfileScreen() {
  const { user, loading, partnerId, fetchUserDetails, addPartner, logout } =
    useProfileViewModel();
  const { getInitials } = useHelper();
  const [partnerInput, setPartnerInput] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <ScreenWrapper title="Profile">
      <Column gap={8} style={[commonStyles.screenWrapper]}>
        <Row justifyContent="center">
          <Row
            justifyContent="center"
            alignItems="center"
            style={[
              commonStyles.cardContainer,
              commonStyles.secondaryContainer,
              {
                width: 150,
                height: 150,
                marginVertical: 20,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 50,
                fontFamily: theme.fonts.bold,
                color: theme.colors.primary,
              }}
            >
              {getInitials(user?.name)}
            </Text>
          </Row>
        </Row>
        <Row gap={8} alignItems="flex-end">
          <Text style={[commonStyles.smallText]}>Name:</Text>
          <Text style={[commonStyles.subTitleText]}>{user?.name || "N/A"}</Text>
        </Row>
        <Row gap={8} alignItems="flex-end">
          <Text style={[commonStyles.smallText]}>UserId:</Text>
          <Text style={[commonStyles.subTitleText]}>
            {user?.userId || "N/A"}
          </Text>
        </Row>
        {partnerId ? (
          <Row gap={8} alignItems="flex-end">
            <Text style={[commonStyles.smallText]}>Partner:</Text>
            <Text style={[commonStyles.subTitleText]}>
              {partnerId || "N/A"}
            </Text>
          </Row>
        ) : (
          <Column>
            <Spacer size={50} />
            <Text style={[commonStyles.smallText]}>Add Partner Id:</Text>

            <CustomInput value={partnerInput} onChangeText={setPartnerInput} />

            <CustomButton
              title="Add"
              outlined
              onPress={() => {
                if (!partnerInput) {
                  Alert.alert("Error", "Please enter Partner ID");
                  return;
                }
                addPartner(partnerInput);
                setPartnerInput("");
              }}
            />
          </Column>
        )}
      </Column>
      <Row style={{ paddingHorizontal: isAndroid ? 10 : 16 }}>
        <CustomButton rounded title="Logout" onPress={logout} error />
      </Row>
    </ScreenWrapper>
  );
}
