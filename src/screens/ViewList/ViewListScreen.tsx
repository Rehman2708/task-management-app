import React, { useState } from "react";
import { View, Text, Alert, Pressable, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import { ROUTES } from "../../enums/routes";
import { Column, Row, Spacer, isAndroid } from "../../tools";
import CustomButton from "../../components/customButton";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import CollapsibleHeader from "../../components/collapsibleHeader";
import { useHelper } from "../../utils/helper";
import { useViewListViewModel } from "./useListDetailViewModel";
import EmptyState from "../../components/emptyState";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { AppUrl } from "../../utils/appUrl";
import CommentsModal from "../../components/comments/commentModal";

interface ViewListScreenProps {
  route: {
    params?: {
      listId: string;
      showComments?: boolean;
    };
  };
}

export default function ViewListScreen({ route }: ViewListScreenProps) {
  const { listId, showComments } = route.params || {};
  const {
    list,
    loading,
    updating,
    error,
    deleteList,
    toggleItemCompletion,
    totalComments,
    setTotalComments,
  } = useViewListViewModel(listId);
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const navigation: any = useNavigation();
  const { formatDate } = useHelper();
  const [commentsModalVisible, setCommentsModalVisible] = useState(
    showComments ?? false
  );

  const handleOpenComments = () => setCommentsModalVisible(true);

  const handleDelete = () => {
    Alert.alert("Delete List", "Are you sure you want to delete this list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteList },
    ]);
  };

  const renderListItem = ({ item, index }: { item: any; index: number }) => (
    <Row
      alignItems="center"
      justifyContent="space-between"
      style={[
        commonStyles.cardContainer,
        {
          backgroundColor: item.completed
            ? theme.colors.success + "20"
            : theme.colors.error + "20",
        },
      ]}
    >
      <Text style={[commonStyles.subTitleText]}>
        {index + 1}.{`  `}
      </Text>
      <Text
        style={[
          commonStyles.smallText,
          commonStyles.fullFlex,
          {
            textDecorationLine: item.completed ? "line-through" : "none",
            color: item.completed ? theme.colors.textLight : theme.colors.text,
          },
        ]}
      >
        {item.text}
      </Text>
      <Spacer size={6} position="right" />
      {!item.completed && (
        <CustomButton
          onPress={() => toggleItemCompletion(index)}
          iconName="checkmark-done-outline"
          title="Send"
          sendButton
          success
        />
      )}
    </Row>
  );
  return (
    <View
      style={[
        commonStyles.fullFlex,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <CollapsibleHeader
        headerImage={list?.image}
        title={list?.title}
        subTitle={formatDate(list?.createdAt!)}
      >
        {loading ? (
          <EmptyState
            loading={loading}
            type={LoaderTypes.ListDetailScreen}
            text={""}
          />
        ) : (
          <>
            <Row justifyContent="space-between" alignItems="center">
              <Column>
                <Text numberOfLines={3} style={commonStyles.titleText}>
                  {list?.title}
                </Text>
                <Text numberOfLines={3} style={commonStyles.tinyText}>
                  {formatDate(list?.createdAt!) ?? ""}
                </Text>
              </Column>
              <Spacer size={6} position="right" />
              <Pressable onPress={() => handleOpenComments()}>
                <Row alignItems="center" gap={6}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={theme.colors.text}
                  />
                  <Text style={commonStyles.smallText}>
                    {totalComments ?? 0} Comment
                    {totalComments > 1 ? "s" : ""}
                  </Text>
                </Row>
              </Pressable>
            </Row>
            <Spacer size={12} />
            <Text style={[commonStyles.basicText]}>{list?.description}</Text>
            <Spacer size={16} />
            <FlatList
              data={list?.items || []}
              keyExtractor={(_, i) => i.toString()}
              renderItem={renderListItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={commonStyles.smallText}>
                  No items in this list.
                </Text>
              }
            />
          </>
        )}
      </CollapsibleHeader>
      <Row
        justifyContent="space-between"
        style={{ paddingHorizontal: isAndroid ? 8 : 16 }}
        alignItems="center"
      >
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate(ROUTES.CREATE_LIST, { list })}
          rounded
          halfWidth
        />
        <CustomButton
          title="Delete"
          onPress={handleDelete}
          rounded
          halfWidth
          error
          loading={updating}
        />
      </Row>
      {listId && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          fetchUrl={`${AppUrl.getListComments(listId)}`}
          postUrl={`${AppUrl.addListComment(listId)}`}
          entityId={listId}
          setCount={setTotalComments}
        />
      )}
    </View>
  );
}
