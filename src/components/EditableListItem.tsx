import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../infrastructure/theme";
import { useCommonStyles } from "../styles/commonstyles";
import { Row, Spacer } from "../tools";
import CustomButton from "./customButton";
import { ListItem } from "../repositories/lists";

interface EditableListItemProps {
  item: ListItem;
  index: number;
  onToggleComplete: (index: number) => void;
  onUpdateText: (index: number, newText: string) => void;
  onDelete: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  dragEnabled?: boolean;
  showCompletionToggle?: boolean;
  totalItems?: number;
}

const EditableListItem: React.FC<EditableListItemProps> = ({
  item,
  index,
  onToggleComplete,
  onUpdateText,
  onDelete,
  onReorder,
  dragEnabled = true,
  showCompletionToggle = true,
  totalItems = 1,
}) => {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Animation values for drag
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const ITEM_HEIGHT = 100;

  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  // Drag gesture using new API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (dragEnabled && !isEditing && onReorder) {
        scale.value = withSpring(1.02);
      }
    })
    .onUpdate((event) => {
      if (dragEnabled && !isEditing && onReorder) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (dragEnabled && !isEditing && onReorder) {
        const itemsMoved = Math.round(event.translationY / ITEM_HEIGHT);
        const newIndex = Math.max(
          0,
          Math.min(totalItems - 1, index + itemsMoved)
        );

        translateY.value = withSpring(0);
        scale.value = withSpring(1);

        if (newIndex !== index) {
          runOnJS(onReorder)(index, newIndex);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: translateY.value !== 0 ? 0.8 : 1,
    zIndex: translateY.value !== 0 ? 1000 : 1,
    elevation: translateY.value !== 0 ? 10 : 0,
  }));

  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== item.text && editText.trim().length > 0) {
      onUpdateText(index, editText.trim());
    } else if (editText.trim().length === 0) {
      setEditText(item.text);
    }
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const handleCancelEdit = () => {
    setEditText(item.text);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(index) },
    ]);
  };

  const handleLongPress = () => {
    if (!isEditing) {
      setShowDeleteButton(!showDeleteButton);
    }
  };

  const containerStyle = [
    commonStyles.cardContainer,
    {
      backgroundColor: item.completed
        ? theme.colors.success + "20"
        : theme.colors.background,
      borderColor: isEditing
        ? theme.colors.primary
        : showDeleteButton
        ? theme.colors.error
        : translateY.value !== 0
        ? theme.colors.primary
        : theme.colors.border,
      borderWidth:
        isEditing || showDeleteButton || translateY.value !== 0 ? 2 : 1,
      marginVertical: 4,
    },
  ];

  const ItemContent = () => (
    <Pressable
      onPress={() => {
        if (showDeleteButton) {
          setShowDeleteButton(false);
        } else if (!isEditing) {
          handleStartEdit();
        }
      }}
      onLongPress={handleLongPress}
      style={containerStyle}
    >
      <Row alignItems="center" justifyContent="space-between">
        {/* Drag Handle */}
        {dragEnabled && !isEditing && (
          <View style={{ marginRight: 8 }}>
            <Ionicons
              name="reorder-two-outline"
              size={20}
              color={theme.colors.textLight}
            />
          </View>
        )}

        {/* Item Number */}
        <Text style={[commonStyles.subTitleText, { minWidth: 30 }]}>
          {index + 1}.
        </Text>

        <Spacer size={8} position="right" />

        {/* Item Text / Edit Input */}
        <View style={[commonStyles.fullFlex]}>
          {isEditing ? (
            <TextInput
              ref={textInputRef}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={handleSaveEdit}
              onBlur={handleSaveEdit}
              style={[
                commonStyles.smallText,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.primary,
                  paddingVertical: 4,
                  color: theme.colors.text,
                },
              ]}
              multiline
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Text
              style={[
                commonStyles.smallText,
                {
                  textDecorationLine: item.completed ? "line-through" : "none",
                  color: item.completed
                    ? theme.colors.textLight
                    : theme.colors.text,
                },
              ]}
            >
              {item.text}
            </Text>
          )}
        </View>

        <Spacer size={8} position="right" />

        {/* Action Buttons */}
        <Row alignItems="center" gap={8}>
          {isEditing ? (
            <>
              <Pressable onPress={handleCancelEdit}>
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={theme.colors.error}
                />
              </Pressable>
              <Pressable onPress={handleSaveEdit}>
                <Ionicons
                  name="checkmark-outline"
                  size={24}
                  color={theme.colors.success}
                />
              </Pressable>
            </>
          ) : showDeleteButton ? (
            <Pressable onPress={handleDelete}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
            </Pressable>
          ) : (
            showCompletionToggle &&
            !item.completed && (
              <CustomButton
                onPress={() => onToggleComplete(index)}
                iconName="checkmark-done-outline"
                title="Complete"
                sendButton
                success
              />
            )
          )}
        </Row>
      </Row>

      {/* Edit Hint */}
      {!isEditing && !showDeleteButton && (
        <Text
          style={[
            commonStyles.tTinyText,
            { textAlign: "center", marginTop: 4 },
          ]}
        >
          {showCompletionToggle
            ? "Tap to edit • Long press for options • Drag to reorder"
            : "Tap to edit • Long press to delete • Drag to reorder"}
        </Text>
      )}
    </Pressable>
  );

  // If drag is enabled and onReorder is provided, wrap with gesture detector
  if (dragEnabled && onReorder) {
    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <ItemContent />
        </Animated.View>
      </GestureDetector>
    );
  }

  // Otherwise, return the item without drag functionality
  return <ItemContent />;
};

export default EditableListItem;
