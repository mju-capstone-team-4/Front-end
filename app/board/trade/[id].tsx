import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";

export default function TradeDetail() {
  const router = useRouter();
  const {
    id,
    itemName,
    description,
    nickname,
    price,
    imageUrl,
  } = useLocalSearchParams();

  const [visible, setVisible] = useState(false);

  const displayTitle = typeof itemName === "string" ? itemName : "제목 없음";
  const displayContent =
    typeof description === "string" ? description : "내용 없음";
  const displayNickname = typeof nickname === "string" ? nickname : "익명";
  const displayPrice =
    typeof price === "string"
      ? `${parseInt(price).toLocaleString()}원`
      : "가격 미정";
  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;

  // ✅ 삭제 요청
  const handleDelete = async () => {
    if (typeof id !== "string") {
      Alert.alert("오류", "잘못된 게시글 ID입니다.");
      return;
    }

    Alert.alert("삭제 확인", "정말로 이 거래글을 삭제하시겠어요?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `http://54.180.238.252:8080/api/trade/${id}`,
              {
                method: "DELETE",
              }
            );
            if (!response.ok) throw new Error("서버 오류");
            Alert.alert("삭제 완료", "거래글이 삭제되었습니다!");
            router.replace("/(tabs)/board");
          } catch (error) {
            Alert.alert("에러", "삭제에 실패했습니다.");
            console.error("❌ 삭제 실패:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.postBox}>
          {/* 제목 + 수정/삭제 아이콘 */}
          <View style={styles.header}>
            <Text style={styles.title}>{displayTitle}</Text>
            <View style={styles.iconButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  if (typeof id === "string") {
                    router.push({
                      pathname: "/board/trade/edit/[id]",
                      params: {
                        id,
                        itemName,
                        description,
                        price,
                        imageUrl,
                      },
                    });
                  }
                }}
              >
                <Ionicons name="create-outline" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { marginLeft: 8 }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.meta}>작성자: {displayNickname}</Text>
          <Text style={styles.meta_price}>가격: {displayPrice}</Text>

          {validImage && (
            <>
              <Pressable onPress={() => setVisible(true)}>
                <Image source={{ uri: validImage }} style={styles.image} />
              </Pressable>
              <ImageView
                images={[{ uri: validImage }]}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setVisible(false)}
              />
            </>
          )}

          <Text style={styles.content}>{displayContent}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonBox}>
        <Button title="채팅하기" onPress={() => alert("채팅 준비 중")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // 밝은 테마
    paddingTop: 60,
  },
  scrollContent: {
    padding: 20,
  },
  postBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 24,
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: 10,
  },
  meta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  meta_price: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  image: {
    marginTop: 12,
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  buttonBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});