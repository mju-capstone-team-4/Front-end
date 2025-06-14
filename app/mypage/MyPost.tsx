// app/mypage/MyPost.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import PotIcon from "@/assets/images/pot.svg";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function MyPost(): React.JSX.Element {
  const router = useRouter();

  const handlePress = () => {
    // (myPage) 폴더 안의 postAll.tsx로 이동 (라우트 경로는 괄호 폴더는 URL에 포함되지 않음)
    router.push("/postAll");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <PotIcon />
      <Text style={styles.title}>나의 게시글</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    width: scaleWidth(366),
    height: scaleHeight(70),
    paddingLeft: 28,
    marginTop: 30,
    borderRadius: 20,
    shadowColor: "#E4E4E4",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    gap: 10,
  },

  title: {
    fontSize: 18,
    fontFamily: "Pretendard-Medium",
  },
});
