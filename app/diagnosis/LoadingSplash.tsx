import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  Easing,
} from "react-native";
import Back1 from "@/assets/images/back1.svg";
import Back2 from "@/assets/images/back2.svg";
import Back3 from "@/assets/images/back3.svg";

import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function LoadingSplash() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      { resetBeforeIteration: true }
    ).start();
  }, [rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
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

      <Animated.View
        style={[styles.circle, { transform: [{ rotate: rotateInterpolate }] }]}
      >
        <Image
          source={require("@/assets/images/flower.png")}
          style={{ width: 300, height: 300 }}
        />
      </Animated.View>
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
    width: 300,
    height: 300,
    borderRadius: 300,
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
