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

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;

    // Check if app is in foreground and this is a comment notification
    const { useNotificationStore } = await import(
      "./src/store/notificationStore"
    );
    const store = useNotificationStore.getState();
    const isAppInForeground = store.isAppInForeground;

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
      setAppInForeground(nextAppState === "active");
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Set initial state
    setAppInForeground(AppState.currentState === "active");

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
            console.log("📱 App launched from notification:", data);
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

                console.log("📱 Notification response received:", {
                  actionIdentifier,
                  userText: userText
                    ? `"${userText.substring(0, 30)}..."`
                    : null,
                  hasData: !!data,
                  dataType: data?.type,
                  dataKeys: data ? Object.keys(data) : [],
                });

                // Handle notification action buttons
                if (
                  actionIdentifier === "complete" &&
                  data?.type === "subtask_reminder"
                ) {
                  await handleSubtaskCompletion(
                    data.taskId,
                    data.subtaskId,
                    data.userId
                  );
                } else if (actionIdentifier === "reply" && userText && data) {
                  // Handle comment reply from notification
                  const { useAuthStore } = await import(
                    "./src/store/authStore"
                  );
                  const userId = useAuthStore.getState().user?.userId;

                  if (userId) {
                    console.log("📱 Sending comment reply for user:", userId);
                    await handleCommentReply(userText, data, userId);
                  } else {
                    console.warn("❌ No user ID found for comment reply");
                    // Show error notification
                    await showErrorNotification(
                      "❌ Error",
                      "Please log in to reply to comments."
                    );
                  }
                } else if (actionIdentifier?.startsWith("view")) {
                  // Handle view actions (view_task, view_note, view_list, view_video)
                  if (navigationRef.isReady()) {
                    handleNotificationNavigation(data);
                  } else {
                    setLaunchedFromNotification(data);
                  }
                } else if (!actionIdentifier && data) {
                  // Handle regular notification tap (no action button)
                  if (navigationRef.isReady()) {
                    handleNotificationNavigation(data);
                  } else {
                    setLaunchedFromNotification(data);
                  }
                }
              } catch (error) {
                console.error(
                  "❌ Error handling notification response:",
                  error
                );
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
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (launchedFromNotification) {
            // handleNotificationNavigation(launchedFromNotification);
            clearLaunchedFromNotification();
          }
        }}
      >
        <StatusBar backgroundColor={"#00000030"} translucent />
        {!isConnected ? <OfflineScreen /> : <AppNavigator />}
      </NavigationContainer>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
