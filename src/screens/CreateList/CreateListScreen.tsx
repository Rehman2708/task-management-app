import { View, Text, FlatList } from "react-native";
import { useListDetailViewModel } from "./useListDetailViewModel";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomInput from "../../components/customInput";
import CustomButton from "../../components/customButton";
import ImageModal from "../../components/imageModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { Row, Spacer } from "../../tools";
import { List } from "../../repositories/lists";
import { createNoteStyle } from "../CreateNote/styles";
import SimpleList from "../../components/SimpleList";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";

interface ListDetailScreenProps {
  route: {
    params?: {
      list?: List;
      userId: string;
    };
  };
}

export default function CreateListScreen({ route }: ListDetailScreenProps) {
  const navigation: any = useNavigation();
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
    saveList,
    items,
    newItem,
    setNewItem,
    addItem,
    removeItem,
    updateItemText,
    reorderItems,
  } = useListDetailViewModel(list);

  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const styles = createNoteStyle(theme);

  const handleSave = async () => {
    const res = await saveList();
    if (res) {
      navigation.reset({
        index: 1,
        routes: [
          { name: ROUTES.TABS },
          { name: ROUTES.VIEW_LIST, params: { listId: res._id } },
        ],
      });
    }
  };

  return (
    <ScreenWrapper
      title={list ? "✏️ Edit List" : "📋 Create List"}
      showBackbutton
      image={image.length ? image : undefined}
      noPadding
    >
      <View style={commonStyles.screenWrapper}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          // scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <ImageModal defaultImage={image} onChange={setImage} />

          <CustomInput title="📝 Title" value={title} onChangeText={setTitle} />

          <CustomInput
            title="📄 Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder={"📄 Enter full description…"}
          />

          <Spacer size={16} />

          {/* Add List Items */}
          <Text style={commonStyles.subTitleText}>📋 List Items</Text>
          <Row alignItems="center" justifyContent="space-between">
            <CustomInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="📝 Enter item..."
              fullFlex
              multiline
              inputStyle={{ minHeight: 50 }}
            />
            <Spacer size={12} position="right" />
            <CustomButton
              title="➕ Add"
              onPress={addItem}
              small
              disabled={!newItem.trim()}
              sendButton
              success
              iconName="add-circle-outline"
            />
          </Row>

          {items.length > 0 ? (
            <SimpleList
              data={items}
              onToggleComplete={() => {}} // No completion toggle in create mode
              onUpdateText={updateItemText}
              onDelete={removeItem}
              onReorder={reorderItems}
              scrollEnabled={false}
              showCompletionToggle={false}
            />
          ) : (
            <Text style={commonStyles.smallText}>
              📝 No items added yet. Add some items above!
            </Text>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </KeyboardAwareScrollView>

        <CustomButton
          title={list?._id ? "✏️ Update" : "💾 Save"}
          loading={loading}
          onPress={handleSave}
        />
      </View>
    </ScreenWrapper>
  );
}
