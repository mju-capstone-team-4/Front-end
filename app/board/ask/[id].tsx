import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import ImageView from "react-native-image-viewing";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function PostDetail() {
  const router = useRouter();
  const { id, title, content, nickname, imageUrl } = useLocalSearchParams();

  const questionId = Array.isArray(id) ? id[0] : id;
  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;

  const [visible, setIsVisible] = useState(false);

  const handleDeletePost = async () => {
    if (!questionId) return;
    Alert.alert("삭제 확인", "정말 이 질문을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `http://54.180.238.252:8080/api/question/${questionId}`,
              { method: "DELETE" }
            );
            if (!res.ok) throw new Error("삭제 실패");
            Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
            router.push("/(tabs)/board");
          } catch (err) {
            Alert.alert("삭제 실패");
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <KeyboardAwareScrollView
          style={styles.contentWrapper}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            {/* ✅ 권한 체크 후 버튼 노출 */}
            {global.userInfo.username === nickname && (
              <View style={styles.icons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    if (typeof questionId === "string") {
                      router.push({
                        pathname: "/board/ask/edit/[id]",
                        params: { id: questionId, title, content, imageUrl },
                      });
                    }
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { marginLeft: 8 }]}
                  onPress={handleDeletePost}
                >
                  <Ionicons name="trash-outline" size={20} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.nickname}>작성자: {nickname || "익명"}</Text>

          {validImage && (
            <>
              <Pressable onPress={() => setIsVisible(true)}>
                <Image source={{ uri: validImage }} style={styles.image} />
              </Pressable>
              <ImageView
                images={[{ uri: validImage }]}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setIsVisible(false)}
              />
            </>
          )}

          <Text style={styles.content}>{content}</Text>
        </KeyboardAwareScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  icons: { flexDirection: "row" },
  iconButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#000", flexShrink: 1 },
  nickname: { color: "#555", marginBottom: 20 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 16 },
  content: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 24 },
});