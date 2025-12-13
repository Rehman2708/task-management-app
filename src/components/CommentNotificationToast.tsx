import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { handleNotificationNavigation } from "../../notification";
import Toast from "react-native-toast-message";
import {
  createBaseToastStyles,
  getToastBorderColor,
} from "../utils/toastStyles";

interface CommentNotificationToastProps {
  title: string;
  message?: string;
  notificationData?: any;
  onPress?: () => void;
}

const CommentNotificationToast: React.FC<CommentNotificationToastProps> = ({
  title,
  message,
  notificationData,
  onPress,
}) => {
  const theme = useTheme();
  const baseStyles = createBaseToastStyles(theme);
  const styles = commentToastStyles(theme);
  const borderColor = getToastBorderColor("primary", theme);

  const handlePress = () => {
    // Hide the toast first
    Toast.hide();

    if (onPress) {
      onPress();
    } else if (notificationData) {
      handleNotificationNavigation(notificationData);
    }
  };

  const hasImage = notificationData?.image;

  return (
    <TouchableOpacity
      style={[baseStyles.baseToastContainer, { borderColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.toastContent}>
        {hasImage && (
          <Image
            source={{ uri: notificationData.image }}
            style={styles.notificationImage}
            resizeMode="cover"
            onError={() => {
              // Silently handle image load errors
              console.log("Toast image failed to load");
            }}
          />
        )}
        <View style={[baseStyles.contentContainer, styles.textContent]}>
          <Text style={[baseStyles.title, styles.titleSpacing]}>{title}</Text>
          {message && (
            <Text style={[baseStyles.message, styles.messageSpacing]}>
              {message}
            </Text>
          )}
          <Text style={styles.tapHint}>Tap to view</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const commentToastStyles = (theme: any) =>
  StyleSheet.create({
    toastContent: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    notificationImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: theme.colors.loaderBg,
    },
    textContent: {
      flex: 1,
    },
    titleSpacing: {
      marginBottom: 4,
    },
    messageSpacing: {
      marginBottom: 6,
    },
    tapHint: {
      fontSize: theme.fontSizes.xs,
      fontFamily: theme.fonts.medium,
      color: theme.colors.primary,
      fontStyle: "italic",
    },
  });

export default CommentNotificationToast;
