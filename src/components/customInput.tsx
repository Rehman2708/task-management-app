import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  TextStyle,
} from "react-native";
import { useTheme } from "../infrastructure/theme";
import { Column, isAndroid, Row } from "../tools";
import { useCommonStyles } from "../styles/commonstyles";
import { Ionicons } from "@expo/vector-icons";
import { useHelper } from "../utils/helper";

export type CustomInputProps = {
  title?: string;
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  numberOfLines?: number;
  error?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  fullFlex?: boolean;
  rounded?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  maxLength?: number;
};

const CustomInput = ({
  title,
  placeholder = "Enter here...",
  value = "",
  onChangeText,
  keyboardType = "default",
  numberOfLines = 1,
  editable = true,
  error = false,
  secureTextEntry = false,
  multiline = false,
  fullFlex = false,
  rounded,
  inputStyle,
  maxLength,
}: CustomInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [maxChar, setMaxChar] = useState<number | undefined>(maxLength);
  const { themeColor } = useHelper();
  const theme = useTheme();
  const styles = customInputStyle(theme);
  const commonStyles = useCommonStyles(theme);

  useEffect(() => {
    // Dynamically set maxChar if title contains specific keywords
    if (title?.toLowerCase().includes("title")) {
      setMaxChar(maxLength ?? 30);
    } else if (title?.toLowerCase().includes("description")) {
      setMaxChar(maxLength ?? 200);
    } else {
      setMaxChar(maxLength);
    }
  }, [title, maxLength]);

  return (
    <Column
      gap={isAndroid ? 5 : 6}
      style={[styles.container, fullFlex ? commonStyles.fullFlex : {}]}
    >
      {title && <Text style={styles.label}>{title}</Text>}

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            error && styles.errorInput,
            multiline && styles.multiline,
            secureTextEntry && styles.passwordInput,
            rounded && styles.rounded,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.border}
          editable={editable}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          value={value}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          maxLength={maxChar}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={themeColor.dark}
            />
          </TouchableOpacity>
        )}
      </View>

      {maxChar && (
        <Row justifyContent="flex-end">
          <Text
            style={[
              commonStyles.tinyText,
              value?.length === maxChar && {
                color: theme.colors.error,
              },
            ]}
          >
            {value?.length ?? 0}/{maxChar}
          </Text>
        </Row>
      )}
    </Column>
  );
};

export default CustomInput;

const customInputStyle = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    label: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.medium,
      color: theme.colors.text,
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isAndroid ? 12 : 14,
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.regular,
      color: theme.colors.text,
    },
    multiline: {
      minHeight: 150,
      textAlignVertical: "top",
    },
    passwordInput: {
      paddingRight: 50,
    },
    rounded: { borderRadius: 26 },
    iconWrapper: {
      position: "absolute",
      right: 12,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    errorInput: {
      borderColor: theme.colors.error || "red",
    },
  });
