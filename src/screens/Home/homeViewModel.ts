import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { useAuthStore } from "../../store/authStore";
import { useHelper } from "../../utils/helper";
import { useUtilStore } from "../../store/utils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useHomeScreenViewModel() {
  const { user } = useAuthStore();
  const { refetchTask } = useUtilStore();
  const { handleNotificationNavigation } = useHelper();
  const navigation: any = useNavigation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch user from local storage
  useEffect(() => {
    (async () => {
      if (user?.userId) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch active tasks
  const fetchTasks = async () => {
    setError(null);
    if (user?.userId) {
      try {
        setLoading(true);
        const response = await TaskRepo.getActiveTasks({
          ownerUserId: user.userId,
        });
        setTasks(response || []);
      } catch (err: any) {
        console.error("Fetch active tasks error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await TaskRepo.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error("Delete task error:", err);
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };
  const deleteTask = (taskId: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteTask(taskId),
      },
    ]);
  };

  useEffect(() => {
    let isReady = false;

    // Mark navigation ready after component mounts
    const timer = setTimeout(() => {
      isReady = true;
    }, 500); // you can adjust this delay if needed

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {}
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notData = response?.notification?.request?.content?.data;

        if (isReady) {
          handleNotificationNavigation(notData);
        } else {
          // If not ready yet, wait a short moment and retry
          setTimeout(() => handleNotificationNavigation(notData), 500);
        }
      });

    return () => {
      clearTimeout(timer);
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    deleteTask,
  };
}
