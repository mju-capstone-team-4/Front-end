import { View, Text, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

export default function Splash() {
  useEffect(() => {
    console.log("스플래시");

    const timer = setTimeout(() => {
      router.replace("/(root)/loginScreen");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌱 Splash 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24 },
});
