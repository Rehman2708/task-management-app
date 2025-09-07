import React, { useState } from "react";
import { View, Button, Text, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../../../components/customButton";

export const AndroidDateTimePicker = ({
  dueDateTime,
  onChange,
}: {
  dueDateTime: Date;
  onChange: (date: Date) => void;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false);
    if (time && selectedDate) {
      const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        time.getHours(),
        time.getMinutes()
      );
      onChange(combinedDateTime);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <CustomButton
        title={dueDateTime ? dueDateTime.toLocaleString() : "No date selected"}
        rounded
        onPress={() => setShowDatePicker(true)}
        customStyle={{ height: 30, width: 250 }}
      />

      {showDatePicker && (
        <DateTimePicker
          value={dueDateTime || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date(Date.now() + 60 * 60 * 1000)}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={dueDateTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};
