import { View, Text, Modal, Pressable } from "react-native";
import React from "react";
import { useHelper } from "../utils/helper";
import { useCommonStyles } from "../styles/commonstyles";
import { useTheme } from "../infrastructure/theme";
import { Row } from "../tools";
import CustomButton from "./customButton";

const AlertModal = ({
  error,
  isVisible,
  loading,
  onClose,
  onConfirm,
  title,
  subTitle,
}: {
  error?: boolean;
  isVisible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subTitle: string;
}) => {
  const theme = useTheme();
  const { themeColor } = useHelper();
  const commonStyles = useCommonStyles(theme);
  if (!isVisible) return;
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000b3",
          justifyContent: "flex-end",
          zIndex: 10000,
        }}
      >
        <Pressable onPress={onClose} style={{ flex: 1 }} />
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: "auto",
            paddingTop: 10,
            ...commonStyles.screenWrapper,
            flex: 0,
            gap: 8,
          }}
        >
          <Text style={[commonStyles.titleText]}>{title}</Text>
          <Text style={[commonStyles.subTitleText]}>{subTitle}</Text>
          <Row justifyContent="space-between">
            <CustomButton
              onPress={onClose}
              title="Cancel"
              halfWidth
              rounded
              outlined
            />
            <CustomButton
              title="Confirm"
              halfWidth
              rounded
              onPress={onConfirm}
              error={error}
              loading={loading}
            />
          </Row>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
