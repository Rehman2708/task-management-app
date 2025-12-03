import { View } from "react-native";
import React from "react";
import { useCommonStyles } from "../styles/commonstyles";
import LinearHeader from "./LinearHeader";
import CustomHeader from "./CustomHeader";
import { isAndroid, Spacer } from "../tools";
import { useTheme } from "../infrastructure/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  rightIcon,
  hideNotificationButton,
}: {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  showImage?: boolean;
  showBackbutton?: boolean;
  noPadding?: boolean;
  onBackButtonPress?: () => void;
  onSearchPress?: () => void;
  image?: string | string[];
  rightIcon?: React.ReactNode;
  hideNotificationButton?: boolean;
}) => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <LinearHeader image={image} />

      <View
        style={[
          commonStyles.screenWrapper,
          noPadding && { paddingHorizontal: 0 },
        ]}
      >
        <Spacer size={isAndroid ? (subTitle ? 10 : 20) : 0} />

        <View style={{ height: title ? 80 + insets.top : 0 }}>
          <Spacer size={insets.top} />
          <View style={[noPadding && { paddingHorizontal: 6 }]}>
            <CustomHeader
              title={title}
              showBackbutton={showBackbutton}
              subTitle={subTitle}
              onBackButtonPress={onBackButtonPress}
              showImage={showImage}
              onSearchPress={onSearchPress}
              hideNotificationButton={hideNotificationButton}
              rightIcon={rightIcon}
            />
          </View>
          {/* {!subTitle && <TimeDisplay />} */}
        </View>
        {children}
      </View>
    </View>
  );
};

export default ScreenWrapper;
