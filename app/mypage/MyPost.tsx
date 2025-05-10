// app/mypage/MyPost.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function MyPost(): JSX.Element {
  const router = useRouter();

  const handlePress = () => {
    // (myPage) 폴더 안의 postAll.tsx로 이동 (라우트 경로는 괄호 폴더는 URL에 포함되지 않음)
    router.push("/postAll");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.title}>나의 게시글</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    paddingLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
});
