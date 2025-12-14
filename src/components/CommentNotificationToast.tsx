import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { handleNotificationNavigation } from "../../notification";
import Toast from "react-native-toast-message";
import {
  createBaseToastStyles,
  getToastBorderColor,
} from "../utils/toastStyles";
import { Row } from "../tools";

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
      <Row alignItems="center">
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
        <View style={[baseStyles.contentContainer]}>
          <Text style={[baseStyles.title]}>{title}</Text>
          {message && <Text style={[baseStyles.message]}>{message}</Text>}
        </View>
      </Row>
    </TouchableOpacity>
  );
};

const commentToastStyles = (theme: any) =>
  StyleSheet.create({
    notificationImage: {
      width: 50,
      height: 50,
      borderRadius: 10,
      marginRight: 12,
      backgroundColor: theme.colors.loaderBg,
    },
  });

export default CommentNotificationToast;
