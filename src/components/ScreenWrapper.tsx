import { SafeAreaView, View } from "react-native";
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
}: {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  showImage?: boolean;
  showBackbutton?: boolean;
  onBackButtonPress?: () => void;
  image?: string;
}) => {
  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <LinearHeader image={image} />

      <SafeAreaView style={[commonStyles.screenWrapper]}>
        <Spacer size={isAndroid ? (subTitle ? 10 : 20) : 0} />

        <View style={{ height: title ? 80 : 0 }}>
          <CustomHeader
            title={title}
            showBackbutton={showBackbutton}
            subTitle={subTitle}
            onBackButtonPress={onBackButtonPress}
            showImage={showImage}
          />
          {/* {!subTitle && <TimeDisplay />} */}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default ScreenWrapper;
