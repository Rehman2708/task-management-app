import React from "react";
import { View, ScrollView } from "react-native";
import { ListItem } from "../repositories/lists";
import EditableListItem from "./EditableListItem";

interface SimpleListProps {
  data: ListItem[];
  onToggleComplete: (index: number) => void;
  onUpdateText: (index: number, newText: string) => void;
  onDelete: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  scrollEnabled?: boolean;
  showCompletionToggle?: boolean;
}

const SimpleList: React.FC<SimpleListProps> = ({
  data,
  onToggleComplete,
  onUpdateText,
  onDelete,
  onReorder,
  scrollEnabled = false,
  showCompletionToggle = true,
}) => {
  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <View>
        {data.map((item, index) => (
          <EditableListItem
            key={`${index}-${item.text}`}
            item={item}
            index={index}
            onToggleComplete={onToggleComplete}
            onUpdateText={onUpdateText}
            onDelete={onDelete}
            onReorder={onReorder}
            dragEnabled={true}
            showCompletionToggle={showCompletionToggle}
            totalItems={data.length}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default SimpleList;
