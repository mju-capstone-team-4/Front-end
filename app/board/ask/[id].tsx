import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";

export default function PostDetail() {
  const router = useRouter();
  const { id, title, content, nickname, imageUrl } = useLocalSearchParams();

  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(["temp1"]);
  const [visible, setIsVisible] = useState(false);

  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;
  const displayTitle = typeof title === "string" ? title : "제목 없음";
  const displayContent = typeof content === "string" ? content : "내용 없음";
  const displayNickname = typeof nickname === "string" ? nickname : "익명";
  const questionId = Array.isArray(id) ? id[0] : id;

  const handleAddComment = () => {
    if (commentInput.trim() === "") return;
    setComments([...comments, commentInput]);
    setCommentInput("");
  };

  // ✅ 삭제 동작 구현
  const handleDelete = async () => {
    if (!questionId) {
      Alert.alert("오류", "유효하지 않은 질문 ID입니다.");
      return;
    }

    Alert.alert("삭제 확인", "정말 이 질문을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`http://43.201.33.187:8080/api/question/${questionId}`, {
              method: "DELETE",
            });

            if (!response.ok) throw new Error("삭제 실패");

            Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
            router.push("/(tabs)/board");
          } catch (error) {
            Alert.alert("에러", "삭제 중 오류가 발생했습니다.");
            console.error("삭제 오류:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 게시글 박스 */}
      <View style={styles.postBox}>
        {/* 제목 + 수정/삭제 버튼 */}
        <View style={styles.header}>
          <Text style={styles.title}>{displayTitle}</Text>
          <View style={styles.iconButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (typeof questionId === "string") {
                  router.push({
                    pathname: "/board/ask/edit/[id]",
                    params: { id: questionId, title, content, imageUrl },
                  });
                } else {
                  Alert.alert("오류", "잘못된 게시글 ID입니다.");
                }
              }}
            >
              <Ionicons name="pencil-outline" size={20} />
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

        <Text style={styles.content}>{displayContent}</Text>
      </View>

      {/* 댓글 영역 */}
      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>💬 댓글</Text>

        <FlatList
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.commentText}>- {item}</Text>
          )}
        />

        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          value={commentInput}
          onChangeText={(text) => setCommentInput(text)}
          maxLength={150}
          multiline
        />
        <Text style={styles.charCount}>{commentInput.length} / 150</Text>

        <Button title="등록" onPress={handleAddComment} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: 10,
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
  meta: {
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
  commentSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentText: {
    fontSize: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginTop: 12,
    borderRadius: 6,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    marginTop: 4,
  },
});