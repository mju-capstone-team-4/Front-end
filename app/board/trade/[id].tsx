import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Button,
} from "react-native";
import React from "react";

export default function TradeDetail() {
  const { id, title, content, nickname, price } = useLocalSearchParams();

  const handleChat = () => {
    alert("채팅 기능은 아직 구현 중입니다!");
  };

  return (
    <View style={styles.container}>
      {/* 게시글 박스 */}
      <View style={styles.postBox}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>작성자: {nickname}</Text>
        <Text style={styles.meta_price}>가격: {price}</Text>
        <Text style={styles.content}>{content}</Text>
      </View>

      {/* 채팅 버튼 */}
      <View style={styles.buttonBox}>
        <Button title="채팅하기" onPress={handleChat} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    paddingTop: 60,
  },
  postBox: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 24,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#444",
    width: 60,
  },
  value: {
    color: "#555",
    flexShrink: 1,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  buttonBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  meta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 1,
  },
  meta_price: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
});