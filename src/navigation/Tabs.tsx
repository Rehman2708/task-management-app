import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import HistoryScreen from "../screens/History/HistoryScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import NotesScreen from "../screens/Notes/NotesScreen";
import { ROUTES } from "../enums/routes";
import { Ionicons } from "@expo/vector-icons";
import BottomTab from "./bottomTab";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTab {...props} />}
    >
      <Tab.Screen name={ROUTES.TASKS} component={HomeScreen} />
      <Tab.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
      <Tab.Screen name={ROUTES.NOTES} component={NotesScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
