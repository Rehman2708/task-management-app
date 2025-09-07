import { SafeAreaView, View } from "react-native";
import React from "react";
import { commonStyles } from "../styles/commonstyles";
import LinearHeader from "./LinearHeader";
import CustomHeader from "./CustomHeader";
import TimeDisplay from "./time";
import { isAndroid, Spacer } from "../tools";

const ScreenWrapper = ({
  children,
  title,
  subTitle,
  showBackbutton,
  onBackButtonPress,
}: {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  showBackbutton?: boolean;
  onBackButtonPress?: () => void;
}) => {
  return (
    <View style={[commonStyles.fullFlex, { backgroundColor: "#fff" }]}>
      <LinearHeader />

      <SafeAreaView style={[commonStyles.screenWrapper]}>
        <Spacer size={isAndroid ? 10 : 0} />

        <View style={{ height: title ? 80 : 0 }}>
          <CustomHeader
            title={title}
            showBackbutton={showBackbutton}
            subTitle={subTitle}
            onBackButtonPress={onBackButtonPress}
          />
          {/* {!subTitle && <TimeDisplay />} */}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default ScreenWrapper;
