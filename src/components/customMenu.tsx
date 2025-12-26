import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import React, { memo, useState } from "react";
import { Divider, Menu } from "react-native-paper";
import { useTheme } from "../infrastructure/theme";
import { useHelper } from "../utils/helper";
import { Ionicons } from "@expo/vector-icons";

const useStyles = () => {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginTop: 30,
      maxHeight: 250,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconStyle: {
      paddingLeft: 20,
    },
    titleStyle: {
      color: theme.colors.text,
      fontFamily: theme.fonts.regular,
      marginTop: -2,
      fontWeight: "500",
      textAlign: "center",
      paddingRight: 22,
      fontSize: theme.fontSizes.md,
    },
    errorTitleStyle: {
      color: theme.colors.error,
    },
    activeTitleStyle: {
      paddingLeft: 20,
    },
  });
};

export interface IMenuContentItem {
  title: string;
  onPress?: () => void;
  error?: boolean;
}

interface ICustomMenuProps {
  content: IMenuContentItem[];
  button?: React.ReactNode;
  showActiveIcon?: boolean;
  color?: string;
  whiteBg?: boolean;
}

const CustomMenu: React.FC<ICustomMenuProps> = ({
  content,
  button,
  showActiveIcon,
  color,
  whiteBg,
}) => {
  const menuContent = content || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu((prev) => !prev);
  const { themeColor: studentColors } = useHelper();
  const handlePress = (index: number, onPress?: () => void) => {
    onPress?.();
    setActiveIndex(index);
    toggleMenu();
  };
  const theme = useTheme();
  const menuStyles = useStyles();
  const LeadingIcon = (index: number) =>
    showActiveIcon && (
      <Ionicons
        name={"checkmark-outline"}
        size={26}
        color={
          index === activeIndex
            ? whiteBg
              ? theme.colors.text
              : theme.colors.white
            : "transparent"
        }
      />
    );

  return (
    <Menu
      visible={showMenu}
      onDismiss={toggleMenu}
      contentStyle={menuStyles.container}
      anchor={
        button ? (
          <TouchableOpacity onPress={toggleMenu}>{button}</TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleMenu} style={menuStyles.iconStyle}>
            <Ionicons
              name="ellipsis-vertical"
              size={26}
              color={whiteBg ? theme.colors.text : theme.colors.white}
            />
          </TouchableOpacity>
        )
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 250 }}
      >
        {menuContent.map((item: IMenuContentItem, index) => (
          <View key={index}>
            {index !== 0 && (
              <Divider style={{ backgroundColor: theme.colors.border }} />
            )}
            <Menu.Item
              titleStyle={[
                menuStyles.titleStyle,
                item.error && menuStyles.errorTitleStyle,
              ]}
              style={[
                menuStyles.titleStyle,
                showActiveIcon && menuStyles.activeTitleStyle,
                // activeIndex === index &&
                //   !!color && {
                //     backgroundColor: `${color}30`,
                //   },
              ]}
              onPress={() => handlePress(index, item.onPress)}
              title={item.title}
              leadingIcon={() => LeadingIcon(index)}
            />
          </View>
        ))}
      </ScrollView>
    </Menu>
  );
};

export default memo(CustomMenu);
