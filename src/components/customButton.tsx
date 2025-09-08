import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { theme } from "../infrastructure/theme";
import { commonStyles } from "../styles/commonstyles";
import { Row } from "../tools";
import { Ionicons } from "@expo/vector-icons";
import { useHelper } from "../utils/helper";

interface ICustomButton {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  small?: boolean;
  loading?: boolean;
  outlined?: boolean;
  halfWidth?: boolean;
  rounded?: boolean;
  customStyle?: ViewStyle;
  nextButton?: boolean;
  secondary?: boolean;
  error?: boolean;
  success?: boolean;
  sendButton?: boolean;
}

const CustomButton = ({
  title = "",
  onPress,
  loading = false,
  outlined = false,
  disabled = false,
  small = false,
  halfWidth = false,
  rounded = false,
  customStyle,
  secondary = false,
  error = false,
  success = false,
  sendButton,
}: ICustomButton) => {
  const { themeColor } = useHelper();
  const buttonStyles = [
    styles.button,
    {
      backgroundColor: themeColor?.dark ?? theme.colors.primary,
    },
    small && styles.small,
    halfWidth && commonStyles.halfWidth,
    rounded && styles.rounded,
    outlined && styles.outlined,
    secondary && styles.secondary,
    error && styles.error,
    success && styles.success,
    disabled && styles.disabled,
    customStyle,
  ];
  const textStyles = [
    styles.text,
    small && { ...commonStyles.smallText, ...commonStyles.whiteText },
    outlined && { color: themeColor?.dark ?? theme.colors.primary },
    secondary && { color: themeColor?.light ?? theme.colors.secondary },
    (error || success) && { color: theme.colors.white },
  ];
  if (sendButton) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading}>
        <Row
          justifyContent="center"
          alignItems="center"
          style={{
            padding: 12,
            borderRadius: 100,
            backgroundColor: themeColor?.dark ?? theme.colors.primary,
          }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                outlined || secondary
                  ? themeColor?.dark ?? theme.colors.primary
                  : theme.colors.white
              }
            />
          ) : (
            <Ionicons
              name="send-outline"
              size={20}
              color={theme.colors.white}
            />
          )}
        </Row>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            outlined || secondary
              ? themeColor?.dark ?? theme.colors.primary
              : theme.colors.white
          }
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0,
    marginVertical: 8,
    width: "100%",
    backgroundColor: theme.colors.primary,
  },
  outlined: {
    backgroundColor: theme.colors.transparent,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  small: {
    height: 44,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  rounded: {
    borderRadius: 500,
  },
  text: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
    color: theme.colors.white,
  },
});
