import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";

import TaskDetailScreen from "../screens/TaskDetail/TaskDetailScreen";
import { LoginScreen } from "../screens/Login/LoginScreen";
import { RegisterScreen } from "../screens/Register/RegisterScreen";
import { CreateTaskScreen } from "../screens/CreateTask/CreateTaskScreen";
import CreateNotesScreen from "../screens/CreateNote/CreateNote";
import ThemeScreen from "../screens/theme/ThemeScreen";
import { ROUTES } from "../enums/routes";
import SplashScreen from "../screens/Splash/SplashScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initial, setInitial] = useState<ROUTES.SPLASH>(ROUTES.SPLASH);

  return (
    <Stack.Navigator
      initialRouteName={initial}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.TABS} component={Tabs} />
      <Stack.Screen name={ROUTES.CREATE_TASK} component={CreateTaskScreen} />
      <Stack.Screen name={ROUTES.TASK_DETAIL} component={TaskDetailScreen} />
      <Stack.Screen name={ROUTES.CREATE_NOTE} component={CreateNotesScreen} />
      <Stack.Screen name={ROUTES.THEME} component={ThemeScreen} />
    </Stack.Navigator>
  );
}
