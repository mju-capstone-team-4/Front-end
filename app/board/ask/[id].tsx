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

  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [visible, setIsVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const questionId = Array.isArray(id) ? id[0] : id;
  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `http://54.180.238.252:8080/api/question/${questionId}/comments`
      );
      const data = await res.json();
      setComments(data.content || []);
    } catch (err) {
      console.error("❌ 댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [questionId]);

  const handleAddOrUpdateComment = async () => {
    const textToSend = editingCommentId ? editingText : commentInput;
    if (!textToSend.trim()) return;

    try {
      const url = editingCommentId
        ? `http://54.180.238.252:8080/api/comment/${editingCommentId}`
        : `http://54.180.238.252:8080/api/question/${questionId}/comment`;

      const method = editingCommentId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: textToSend }),
      });

      setEditingCommentId(null);
      setEditingText("");
      setCommentInput("");
      fetchComments();
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert("❌ 댓글 등록/수정 실패");
    }
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingText(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

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
              {
                method: "DELETE",
              }
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

  const handleDeleteComment = (commentId: number) => {
    Alert.alert("댓글 삭제 확인", "정말 이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`http://54.180.238.252:8080/api/comment/${commentId}`, {
              method: "DELETE",
            });
            fetchComments();
          } catch (err) {
            Alert.alert("❌ 댓글 삭제 실패");
          }
        },
      },
    ]);
  };

  const handleLikeToggle = async (commentId: number, liked: boolean) => {
    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(
        `http://54.180.238.252:8080/api/comments/${commentId}/likes`,
        {
          method,
        }
      );
      const responseText = await res.text();

      if (!res.ok) {
        throw new Error("좋아요 처리 실패: " + responseText);
      }
      fetchComments();
    } catch (err) {
      Alert.alert("❌ 좋아요 처리 실패");
    }
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
          <Text style={styles.commentTitle}>💬 댓글</Text>

          {comments.map((c) => (
            <View key={c.commentId} style={styles.commentItem}>
              <Ionicons name="person-circle-outline" size={30} color="#777" />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentNickname}>익명</Text>
                  <View style={styles.commentActions}>
                    <View style={styles.likeWrapper}>
                      <TouchableOpacity
                        onPress={() => handleLikeToggle(c.commentId, c.liked)}
                      >
                        <Ionicons
                          name="thumbs-up-outline"
                          size={16}
                          color={c.liked ? "#000" : "#aaa"}
                          style={styles.iconSpacing}
                        />
                      </TouchableOpacity>
                      <Text style={styles.recommendCount}>{c.likeCount}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEdit(c.commentId, c.content)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#666"
                        style={styles.iconSpacing}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(c.commentId)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {editingCommentId === c.commentId ? (
                  <>
                    <TextInput
                      style={styles.editInput}
                      value={editingText}
                      onChangeText={setEditingText}
                      multiline
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAddOrUpdateComment}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          완료
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelEdit}
                      >
                        <Text style={{ color: "#666" }}>취소</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.commentText}>{c.content}</Text>
                )}
              </View>
            </View>
          ))}
        </KeyboardAwareScrollView>

        {editingCommentId === null && (
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.input}
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddOrUpdateComment}>
              <Ionicons name="send" size={24} color="#3f6cff" />
            </TouchableOpacity>
          </View>
        )}
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
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  commentContent: {
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  commentNickname: { color: "#333", fontWeight: "bold" },
  commentText: { color: "#000", fontSize: 14, marginTop: 6 },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentActions: {
    flexDirection: "row",
  },
  iconSpacing: {
    marginRight: 8,
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    color: "#000",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    marginRight: 10,
  },
  editInput: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  editButtons: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#3f6cff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recommendCount: {
    fontSize: 12,
    color: "#666",
  },
  likeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 4,
  },
});
