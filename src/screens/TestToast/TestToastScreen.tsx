import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import ToastService from "../../utils/toastService";

const TestToastScreen: React.FC = () => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = testToastStyles(theme);

  // Test data for different notification types
  const testNotifications = [
    {
      title: "💬 New Comment",
      message: "John commented on your task",
      type: "Task Comment",
      data: {
        type: "task",
        taskId: "test-task-id",
        isComment: true,
        image: "https://picsum.photos/200/200?random=1", // Random image
      },
    },
    {
      title: "💬 New Comment",
      message: "Sarah replied to your note",
      type: "Note Comment",
      data: {
        type: "note",
        noteId: "test-note-id",
        isComment: true,
        image: "https://picsum.photos/200/200?random=2",
      },
    },
    {
      title: "💬 New Comment",
      message: "Mike commented on your list",
      type: "List Comment",
      data: {
        type: "list",
        listId: "test-list-id",
        isComment: true,
        image: "https://picsum.photos/200/200?random=3",
      },
    },
    {
      title: "💬 New Comment",
      message: "Emma commented on your video",
      type: "Video Comment",
      data: {
        type: "video",
        videoData: { id: "test-video-id" },
        isComment: true,
        image: "https://picsum.photos/200/200?random=4", // Video thumbnail
      },
    },
    {
      title: "💬 3 new comments",
      message: "Multiple people commented on your task",
      type: "Grouped Comments",
      data: {
        type: "task",
        taskId: "test-task-id",
        isComment: true,
        isGrouped: true,
        commentCount: 3,
        image: "https://picsum.photos/200/200?random=5",
      },
    },
    {
      title: "💬 New Comment",
      message: "Alex commented on your task (no image)",
      type: "Comment Without Image",
      data: {
        type: "task",
        taskId: "test-task-id",
        isComment: true,
        // No image property
      },
    },
  ];

  const showTestToast = (notification: any) => {
    ToastService.commentNotification({
      title: notification.title,
      message: notification.message,
      notificationData: notification.data,
      duration: 8000, // Longer duration for testing
      onPress: () => {
        console.log("Toast pressed for:", notification.type);
        ToastService.success({
          title: "Navigation Triggered",
          message: `Would navigate to ${notification.type}`,
        });
      },
    });
  };

  const showOtherToasts = () => {
    ToastService.success({
      title: "Success Toast",
      message: "This is a success message",
    });

    setTimeout(() => {
      ToastService.error({
        title: "Error Toast",
        message: "This is an error message",
      });
    }, 1000);

    setTimeout(() => {
      ToastService.info({
        title: "Info Toast",
        message: "This is an info message",
      });
    }, 2000);

    setTimeout(() => {
      ToastService.warning({
        title: "Warning Toast",
        message: "This is a warning message",
      });
    }, 3000);
  };

  return (
    <View style={[commonStyles.fullFlex, styles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>🧪 Toast Testing</Text>
        <Text style={styles.subHeader}>
          Test comment notifications with images
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment Notifications</Text>
          {testNotifications.map((notification, index) => (
            <TouchableOpacity
              key={index}
              style={styles.testButton}
              onPress={() => showTestToast(notification)}
            >
              <Text style={styles.buttonText}>{notification.type}</Text>
              <Text style={styles.buttonSubtext}>{notification.message}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Toast Types</Text>
          <TouchableOpacity
            style={[styles.testButton, styles.otherButton]}
            onPress={showOtherToasts}
          >
            <Text style={styles.buttonText}>Show All Toast Types</Text>
            <Text style={styles.buttonSubtext}>
              Success, Error, Info, Warning (with delay)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📋 Instructions:</Text>
          <Text style={styles.instructionText}>
            • Tap any button to show a toast notification
          </Text>
          <Text style={styles.instructionText}>
            • Comment toasts show for 8 seconds (longer for testing)
          </Text>
          <Text style={styles.instructionText}>
            • Tap the toast to trigger navigation
          </Text>
          <Text style={styles.instructionText}>
            • Images are loaded from random URLs for testing
          </Text>
          <Text style={styles.instructionText}>
            • Check console for navigation logs
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const testToastStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subHeader: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textLight,
      textAlign: "center",
      marginBottom: 30,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fonts.semibold,
      color: theme.colors.text,
      marginBottom: 15,
    },
    testButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    otherButton: {
      backgroundColor: theme.colors.secondary,
    },
    buttonText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.semibold,
      color: theme.colors.white,
      marginBottom: 4,
    },
    buttonSubtext: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.medium,
      color: theme.colors.white,
      opacity: 0.9,
    },
    instructions: {
      backgroundColor: theme.colors.backgroundLight,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    instructionTitle: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.semibold,
      color: theme.colors.text,
      marginBottom: 8,
    },
    instructionText: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.medium,
      color: theme.colors.textLight,
      marginBottom: 4,
      lineHeight: 18,
    },
  });

export default TestToastScreen;
