import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonStyles } from "../styles/commonstyles";

const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const formatTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
    // return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.basicText, commonStyles.whiteText]}>
        {formatTime(currentTime)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 15,
  },
});

export default TimeDisplay;
