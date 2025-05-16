import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import PlantyLogo from "@/assets/images/plantylogo.svg";
import Back1 from "@/assets/images/back1.svg";
import Back2 from "@/assets/images/back2.svg";
import Back3 from "@/assets/images/back3.svg";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  useEffect(() => {
    console.log("스플래시");

    const timer = setTimeout(() => {
      router.replace("/(root)/loginScreen");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded] = useFonts({
    Dunkin: require("../../assets/fonts/Dunkin.otf"),
    "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.otf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.otf"),
    "Pretendard-Thin": require("../../assets/fonts/Pretendard-Thin.otf"),
    "Pretendard-Medium": require("../../assets/fonts/Pretendard-Medium.otf"),
  });
  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#00D282", "#FDDB83"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Back1 style={styles.back1} />
      <Back2 style={styles.back2} />
      <Back3 style={styles.back3} />
      <Text style={styles.title}>Planty</Text>
      <Text style={styles.subtitle}>내 손 안의 반려식물 어플</Text>
      <View style={styles.circle} />
      <PlantyLogo width={170} height={343} style={styles.logo} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: { fontSize: 50, fontFamily: "Dunkin", color: "#fff", marginTop: 142 },
  subtitle: {
    fontFamily: "Pretendard-Medium",
    color: "white",
    fontSize: 24,
    marginTop: 10,
  },
  circle: {
    position: "absolute",
    width: 607,
    height: 607,
    backgroundColor: "white",
    borderRadius: 303.5,
    top: height / 1.8,
  },
  logo: {
    position: "absolute",
    top: height / 1.7,
    shadowColor: "rgba(18, 107, 73, 0.27)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6.6,
  },
  back1: {
    position: "absolute",
    top: 0,
    left: width / 15,
  },
  back2: {
    position: "absolute",
    top: height / 3.5,
    right: width / 20,
  },
  back3: {
    position: "absolute",
    top: height / 2.1,
    left: width / 8,
  },
});
