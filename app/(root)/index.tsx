import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function HomeScreen() {

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/board"); // 이전 화면 삭제
    }, 1000); // 1초 뒤 이동

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>시작 페이지 </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  text: { fontSize: 20, fontWeight: "bold" },
});