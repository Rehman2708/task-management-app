import { SafeAreaView, StatusBar, View } from "react-native";
import React from "react";
import { commonStyles } from "../styles/commonstyles";
import LinearHeader from "./LinearHeader";
import CustomHeader from "./CustomHeader";
import { isAndroid, Spacer } from "../tools";
import { theme } from "../infrastructure/theme";

const ScreenWrapper = ({
  children,
  title,
  subTitle,
  showBackbutton,
  onBackButtonPress,
  image,
  showImage,
  onSearchPress,
  noPadding,
}: {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  showImage?: boolean;
  showBackbutton?: boolean;
  noPadding?: boolean;
  onBackButtonPress?: () => void;
  onSearchPress?: () => void;
  image?: string;
}) => {
  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar barStyle={"default"} />

      <LinearHeader image={image} />

      <SafeAreaView
        style={[
          commonStyles.screenWrapper,
          noPadding && { paddingHorizontal: 0 },
        ]}
      >
        <Spacer size={isAndroid ? (subTitle ? 10 : 20) : 0} />

        <View style={{ height: title ? 80 : 0 }}>
          <View style={[noPadding && { paddingHorizontal: 6 }]}>
            <CustomHeader
              title={title}
              showBackbutton={showBackbutton}
              subTitle={subTitle}
              onBackButtonPress={onBackButtonPress}
              showImage={showImage}
              onSearchPress={onSearchPress}
            />
          </View>
          {/* {!subTitle && <TimeDisplay />} */}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default ScreenWrapper;
