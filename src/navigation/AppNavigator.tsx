import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";

import TaskDetailScreen from "../screens/TaskDetail/TaskDetailScreen";
import { LoginScreen } from "../screens/Login/LoginScreen";
import { RegisterScreen } from "../screens/Register/RegisterScreen";
import { CreateTaskScreen } from "../screens/CreateTask/CreateTaskScreen";
import CreateNotesScreen from "../screens/CreateNote/CreateNote";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initial, setInitial] = useState<"Login" | "Register" | "Main">(
    "Login"
  );

  return (
    <Stack.Navigator
      initialRouteName={initial}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="CreateNote" component={CreateNotesScreen} />
    </Stack.Navigator>
  );
}
