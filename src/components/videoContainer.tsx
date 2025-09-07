import React from "react";
import { View, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import Video from "react-native-video";

const AuthBgContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <Video
        source={require("../../assets/video/authBgVideo.mp4")}
        muted
        resizeMode="cover"
        repeat
        controls={false}
        style={styles.video}
      />
      <SafeAreaView style={styles.content}>{children}</SafeAreaView>
    </View>
  );
};

export default AuthBgContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
  },
});
