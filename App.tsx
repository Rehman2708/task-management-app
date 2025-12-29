import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import {
  getNotificationPermission,
  handleNotificationNavigation,
  handleCommentReply,
  handleSubtaskCompletion,
  navigationRef,
} from "./notification";
import {
  NotificationData,
  NotificationAction,
} from "./src/enums/notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCommonStyles } from "./src/styles/commonstyles";
import { FontAsset } from "./assets/fonts";
import { useTheme } from "./src/infrastructure/theme";
import { StatusBar, TextInput, Text, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useNotificationStore } from "./src/store/notificationStore";
import { useNetwork } from "./src/utils/useNetwork";
import OfflineScreen from "./src/screens/OfflineScreen/OfflineScreen";
import * as NavigationBar from "expo-navigation-bar";
import { isAndroid } from "./src/tools";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils/toastConfig";
import ToastService from "./src/utils/toastService";
import {
  isCommentNotification,
  getCommentNotificationTitle,
  showErrorNotification,
} from "./src/utils/notificationUtils";
import { Provider } from "react-native-paper";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Parse data from dataString if data is undefined
    let data = notification.request.content.data;

    if (!data && (notification.request.content as any).dataString) {
      try {
        data = JSON.parse((notification.request.content as any).dataString);
      } catch (error) {
        console.error("Failed to parse notification dataString:", error);
      }
    }

    // Check if app is in foreground and this is a comment notification
    const currentAppState = AppState.currentState;
    const isAppInForeground = currentAppState === "active";
    const isComment = isCommentNotification(data);

    if (isAppInForeground && isComment) {
      // Show toast instead of push notification for comment notifications when app is open
      const title = getCommentNotificationTitle(
        notification.request.content.title || "New Comment",
        data
      );

      ToastService.commentNotification({
        title,
        message: notification.request.content.body || undefined,
        notificationData: data,
        duration: 5000,
        onPress: () => {
          handleNotificationNavigation(data);
        },
      });

      // Don't show the push notification
      return {
        shouldShowAlert: false,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    }

    // Show normal push notification for non-comment notifications or when app is in background
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export default function App() {
  const [fontsLoaded] = useFonts(FontAsset);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const isConnected = useNetwork();
  const {
    launchedFromNotification,
    setLaunchedFromNotification,
    clearLaunchedFromNotification,
    setAppInForeground,
  } = useNotificationStore();

  useEffect(() => {
    getNotificationPermission();
  }, []);

  // Track app state to determine if app is in foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const isActive = nextAppState === "active";
      setAppInForeground(isActive);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Set initial state
    const initialState = AppState.currentState === "active";
    setAppInForeground(initialState);

    return () => {
      subscription?.remove();
    };
  }, [setAppInForeground]);

  // ✅ Handle notification taps (foreground, background, or killed state)
  useEffect(() => {
    let responseListener: any;

    const setupNotifications = async () => {
      try {
        // Check for notification that launched the app
        const lastResponse =
          await Notifications.getLastNotificationResponseAsync();
        if (lastResponse?.notification) {
          const data = lastResponse.notification.request.content.data;
          if (data) {
            setLaunchedFromNotification(data);
          }
        }

        // Set up notification response listener
        responseListener =
          Notifications.addNotificationResponseReceivedListener(
            async (response) => {
              try {
                const data = response?.notification?.request?.content?.data;
                const actionIdentifier = response?.actionIdentifier;
                const userText = response?.userText;

                // Handle notification action buttons
                if (
                  actionIdentifier === NotificationAction.Complete &&
                  data?.type === NotificationData.SubtaskReminder
                ) {
                  await handleSubtaskCompletion(
                    data.taskId,
                    data.subtaskId,
                    data.userId
                  );
                } else if (
                  actionIdentifier === NotificationAction.Reply &&
                  userText &&
                  data
                ) {
                  // Handle comment reply from notification
                  const { useAuthStore } = await import(
                    "./src/store/authStore"
                  );
                  const userId = useAuthStore.getState().user?.userId;

                  if (userId) {
                    await handleCommentReply(userText, data, userId);
                  } else {
                    await showErrorNotification(
                      "❌ Error",
                      "Please log in to reply to comments."
                    );
                  }
                } else if (
                  actionIdentifier?.startsWith(NotificationAction.View)
                ) {
                  // Handle view actions (view_task, view_note, view_list, view_video)
                  if (navigationRef.isReady()) {
                    await handleNotificationNavigation(data);
                  } else {
                    setLaunchedFromNotification(data);
                  }
                } else if (
                  (!actionIdentifier ||
                    actionIdentifier ===
                      "expo.modules.notifications.actions.DEFAULT") &&
                  data
                ) {
                  // Handle regular notification tap (no action button or default action)
                  if (navigationRef.isReady()) {
                    await handleNotificationNavigation(data);
                  } else {
                    setLaunchedFromNotification(data);
                  }
                }
              } catch (error) {
                console.error("Error handling notification response:", error);
              }
            }
          );
      } catch (error) {
        console.error("❌ Error setting up notifications:", error);
      }
    };

    // Setup Android navigation bar
    if (isAndroid) {
      NavigationBar.setVisibilityAsync("hidden").catch(console.warn);
      NavigationBar.setBehaviorAsync("overlay-swipe").catch(console.warn);
    }

    setupNotifications();

    // Cleanup function
    return () => {
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;

  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.allowFontScaling = false;

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Provider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            // Navigation from notifications is now handled in splash screen after authentication
            // This prevents double navigation when biometric auth is required
          }}
        >
          <StatusBar backgroundColor={"#00000030"} translucent />
          {!isConnected ? <OfflineScreen /> : <AppNavigator />}
        </NavigationContainer>
        <Toast config={toastConfig} />
      </Provider>
    </GestureHandlerRootView>
  );
}
