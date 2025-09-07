import React, { ReactNode } from "react";
import { Dimensions, Platform, StatusBar, View, ViewStyle } from "react-native";

export type RowColumnProps = {
  flexDirection?: "row" | "column";
  justifyContent?: ViewStyle["justifyContent"];
  alignItems?: ViewStyle["alignItems"];
  flexWrap?: ViewStyle["flexWrap"];
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  gap?: number;
};

const ChildContainer: React.FC<RowColumnProps> = ({
  flexDirection = "column",
  justifyContent = "flex-start",
  alignItems = "stretch",
  flexWrap = "nowrap",
  children,
  style,
  gap = 0,
}) => {
  const childrenWithGap = React.Children.map(children, (child, index) => {
    if (!gap || !child) return child;
    const gapStyle =
      flexDirection === "row"
        ? {
            marginRight: index !== React.Children.count(children) - 1 ? gap : 0,
          }
        : {
            marginBottom:
              index !== React.Children.count(children) - 1 ? gap : 0,
          };
    return <View style={gapStyle}>{child}</View>;
  });

  return (
    <View
      style={[{ flexDirection, justifyContent, alignItems, flexWrap }, style]}
    >
      {childrenWithGap}
    </View>
  );
};

export const Row: React.FC<RowColumnProps> = (props) => {
  return <ChildContainer {...props} flexDirection="row" />;
};

export const Column: React.FC<RowColumnProps> = (props) => {
  return <ChildContainer {...props} flexDirection="column" />;
};

const positionVariant: Record<string, keyof ViewStyle> = {
  top: "marginTop",
  left: "marginLeft",
  right: "marginRight",
  bottom: "marginBottom",
};

const getVariant = (position: keyof ViewStyle, size: number) => ({
  [positionVariant[position]]: size,
});

type SpacerProps = {
  position?: "top" | "left" | "right" | "bottom";
  size: number;
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export const Spacer: React.FC<SpacerProps> = ({
  position = "top",
  size = 0,
  children,
  style,
}) => {
  const computedStyle = getVariant(position, size) || {};
  return <View style={[computedStyle, style]}>{children}</View>;
};

const { width, height } = Dimensions.get("window");
const statusBarHeight = StatusBar.currentHeight || 0;
export const dimensions = { width, height, statusBarHeight };
export const isAndroid = Platform.OS === "android";
