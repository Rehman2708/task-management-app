import React from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
  StyleSheet,
} from "react-native";
import { theme } from "../infrastructure/theme";
import { Column } from "../tools";
import { commonStyles } from "../styles/commonstyles";

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
  secureTextEntry,
  multiline = false,
  fullFlex = false,
}: CustomInputProps) => {
  return (
    <Column
      gap={6}
      style={[styles.container, fullFlex ? commonStyles.fullFlex : {}]}
    >
      {title && <Text style={styles.label}>{title}</Text>}

      <TextInput
        style={[
          styles.input,
          error && styles.errorInput,
          multiline && styles.multiline,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.border}
        editable={editable}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: theme.colors.error || "red",
  },
});

export default CustomInput;
