import React from "react";
import { View, TextInput, StyleSheet, Image, Dimensions } from "react-native";
import SearchIcon from "@/assets/images/search_icon.svg";
import Camera from "@/assets/images/camera.svg";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.all}>
      <View style={styles.searchContainer}>
        <SearchIcon width={18} height={18} style={{ marginRight: 5 }} />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="식물 이름을 검색하세요"
          placeholderTextColor="#9E9E9E"
          style={styles.input}
        />
      </View>
      <Camera />
    </View>
  );
}

const styles = StyleSheet.create({
  all: { flexDirection: "row", alignItems: "center", width: "100%" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00D282",
    borderRadius: 30,
    paddingHorizontal: 12,
    width: scaleWidth(294),
    height: scaleHeight(58),
    margin: 20,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});
