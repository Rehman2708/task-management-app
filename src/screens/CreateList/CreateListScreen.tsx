import React, { useState } from "react";
import { View, Text, Switch, FlatList, Pressable } from "react-native";
import { useListDetailViewModel } from "./useListDetailViewModel";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import ImageModal from "../../components/imageModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { Row, Spacer } from "../../tools";
import { ROUTES } from "../../enums/routes";
import { List } from "../../repositories/lists";
import { createNoteStyle } from "../CreateNote/styles";

interface ListDetailScreenProps {
  route: {
    params?: {
      list?: List;
      userId: string;
    };
  };
}

export default function CreateListScreen({ route }: ListDetailScreenProps) {
  const { list } = route.params || {};
  const {
    title,
    setTitle,
    description,
    setDescription,
    image,
    setImage,
    loading,
    error,
    success,
    saveList,
    items,
    newItem,
    setNewItem,
    addItem,
    removeItem,
  } = useListDetailViewModel(list);

  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = createNoteStyle(theme);
  const navigation: any = useNavigation();

  const handleSave = async () => {
    await saveList();
  };

  return (
    <ScreenWrapper
      title={list ? "Edit List" : "Create List"}
      showBackbutton
      image={image.length ? image : undefined}
    >
      <View style={commonStyles.screenWrapper}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          // scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <ImageModal defaultImage={image} onChange={setImage} />

          <CustomInput title="Title" value={title} onChangeText={setTitle} />

          <CustomInput
            title="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder={"Enter full description…"}
          />

          <Spacer size={16} />

          {/* Add List Items */}
          <Text style={commonStyles.subTitleText}>List Items</Text>
          <Row alignItems="center" justifyContent="space-between">
            <CustomInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Enter item..."
              fullFlex
              multiline
              inputStyle={{ minHeight: 50 }}
            />
            <Spacer size={12} position="right" />
            <CustomButton
              title="Add"
              onPress={addItem}
              small
              disabled={!newItem.trim()}
              sendButton
              success
              iconName="add-circle-outline"
            />
          </Row>

          <FlatList
            data={items}
            keyExtractor={(_, i) => i.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <Row
                justifyContent="space-between"
                alignItems="center"
                style={commonStyles.cardContainer}
              >
                <Text style={[commonStyles.basicText, commonStyles.fullFlex]}>
                  {item.text}
                </Text>
                <Spacer size={12} position="right" />
                <CustomButton
                  title="Add"
                  onPress={() => removeItem(index)}
                  small
                  sendButton
                  error
                  iconName="remove-circle-outline"
                />
              </Row>
            )}
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}
        </KeyboardAwareScrollView>

        <CustomButton
          title={list?._id ? "Update" : "Save"}
          loading={loading}
          onPress={handleSave}
        />
      </View>
    </ScreenWrapper>
  );
}
