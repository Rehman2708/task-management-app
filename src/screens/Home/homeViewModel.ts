import { useState, useEffect } from "react";
import { TaskRepo } from "../../repositories/task";
import { getDataFromAsyncStorage } from "../../utils/localstorage";
import { LocalStorageKey } from "../../enums/localstorage";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useHomeScreenViewModel() {
  const navigation: any = useNavigation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  // Fetch user from local storage
  useEffect(() => {
    (async () => {
      const { data } = await getDataFromAsyncStorage<{ userId: string }>(
        LocalStorageKey.USER
      );
      if (data?.userId) {
        setUserId(data.userId);
        fetchTasks();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch active tasks
  const fetchTasks = async () => {
    const { data } = await getDataFromAsyncStorage<{ userId: string }>(
      LocalStorageKey.USER
    );
    if (data?.userId) {
      try {
        setLoading(true);
        const response = await TaskRepo.getActiveTasks({
          ownerUserId: data.userId,
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
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {}
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notData = response?.notification?.request?.content?.data;
        if (notData?.type === "note") {
          if (notData?.noteData) {
            navigation.navigate(ROUTES.VIEW_NOTE, { note: notData.noteData });
          } else {
            navigation.navigate(ROUTES.NOTES);
          }
          return;
        }
        if (notData?.type === "task") {
          if (notData?.taskId) {
            navigation.navigate(ROUTES.TASK_DETAIL, {
              taskId: notData.taskId,
              readOnly: !notData?.isActive,
            });
          } else {
            navigation.navigate(ROUTES.TASKS);
          }
          return;
        }
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    userId,
    deleteTask,
  };
}
