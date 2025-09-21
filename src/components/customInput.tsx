import { useState } from "react";
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
import { theme } from "../infrastructure/theme";
import { Column, isAndroid } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import { Ionicons } from "@expo/vector-icons"; // Make sure expo/vector-icons is installed

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
};

const CustomInput = ({
  title,
  placeholder = "Enter here...",
  value,
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
}: CustomInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
            inputStyle && inputStyle,
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
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </Column>
  );
};

const styles = StyleSheet.create({
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
    paddingRight: 40, // space for the eye icon
  },
  multiline: {
    minHeight: 200,
    textAlignVertical: "top",
  },
  passwordInput: {
    // additional styling if needed for password fields
  },
  rounded: { borderRadius: 100 },
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

export default CustomInput;
