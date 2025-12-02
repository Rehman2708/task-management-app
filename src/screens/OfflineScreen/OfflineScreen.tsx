import React, { useCallback, useState } from "react";
import { Text } from "react-native";
import { useCommonStyles } from "../../styles/commonstyles";
import { useTheme } from "../../infrastructure/theme";
import { Column } from "../../tools";
import NetInfo from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import CustomButton from "../../components/customButton";
import EmptyState from "../../components/emptyState";

export default function OfflineScreen() {
  const theme = useTheme();
  const navigation: any = useNavigation();

  const commonStyles = useCommonStyles(theme);
  const [loading, setLoading] = useState(false);

  //   const handleRetry = useCallback(async () => {
  //     if (loading) return; // prevent spam clicks

  //     setLoading(true);

  //     // small delay for UX
  //     await new Promise((resolve) => setTimeout(resolve, 600));

  //     const state = await NetInfo.fetch();
  //     const hasInternet = state.isConnected && state.isInternetReachable === true;

  //     setLoading(false);

  //     // if (hasInternet) {
  //     //   navigation.navigate(ROUTES.SPLASH);
  //     // }
  //   }, [loading, navigation]);

  return (
    <EmptyState
      text="No Internet Connection"
      subtext="Please check your network settings"
      error
      // button={handleRetry}
    />
  );
}
