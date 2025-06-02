import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchComments,
  addOrUpdateComment,
  deleteComment,
  toggleLike,
} from "@/service/commentService";
import { deleteQuestion } from "@/service/questionService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const icons = {
  WriteIcon: require("../../../assets/images/write_button.png"),
  DeleteIcon: require("../../../assets/images/trash_icon.png"),
};

export default function PostDetail() {
  const router = useRouter();
  const { id, title, content, nickname, imageUrl, memberId } =
    useLocalSearchParams();

  const questionId = Array.isArray(id) ? id[0] : id;
  const writerId = Array.isArray(memberId) ? memberId[0] : memberId; // 작성자 ID

  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;

  const [visible, setVisible] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const loadComments = async () => {
    if (!questionId) return;
    const result = await fetchComments(questionId);
    setComments(result);
  };
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const storedId = await AsyncStorage.getItem("memberId");
      setMyId(storedId);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    loadComments();
  }, [questionId]);

  const handleAddOrUpdateComment = async () => {
    const text = editingCommentId ? editingText : commentInput;
    if (!text.trim()) return;
    try {
      await addOrUpdateComment(questionId, text, editingCommentId || undefined);
      setEditingCommentId(null);
      setEditingText("");
      setCommentInput("");
      await loadComments();
    } catch {
      Alert.alert("댓글 등록/수정 실패");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch {
      Alert.alert("댓글 삭제 실패");
    }
  };

  const handleLikeToggle = async (commentId: number, liked: boolean) => {
    try {
      await toggleLike(commentId, liked);
      await loadComments();
    } catch {
      Alert.alert("좋아요 실패");
    }
  };

  const handleDeletePost = async () => {
    if (!questionId) return;
    Alert.alert("삭제 확인", "이 게시글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuestion(questionId);
            Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
            router.push("/(tabs)/board");
          } catch {
            Alert.alert("게시글 삭제 실패");
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
          style={styles.scroll}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            {myId && writerId === myId && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push({
                      pathname: "/board/ask/edit/[id]",
                      params: { id: questionId, title, content, imageUrl },
                    })
                  }
                >
                  <Image
                    source={icons.WriteIcon}
                    style={{ width: 32, height: 32 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: 8 }]}
                  onPress={handleDeletePost}
                >
                  <Image
                    source={icons.DeleteIcon}
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.nickname}>작성자: {nickname}</Text>

          {validImage && (
            <>
              <Pressable onPress={() => setVisible(true)}>
                <Image
                  source={{ uri: validImage }}
                  style={{
                    width: "100%",
                    aspectRatio: 1,
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                  resizeMode="contain"
                />
              </Pressable>
              <ImageView
                images={[{ uri: validImage }]}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setVisible(false)}
              />
            </>
          )}

          <Text style={styles.content}>{content}</Text>

          <View style={styles.separator} />

          <Text style={styles.commentTitle}>💬 댓글</Text>

          {comments.length === 0 && (
            <View style={styles.noCommentBox}>
              <Text style={styles.noCommentText}>첫 댓글을 달아보세요!</Text>
            </View>
          )}

          {comments.map((c) => (
            <View key={c.commentId} style={styles.commentBox}>
              <Ionicons name="person-circle-outline" size={30} color="#777" />
              <View style={styles.commentRight}>
                <View style={styles.commentTop}>
                  <Text style={styles.commentNickname}>{c.username}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => handleLikeToggle(c.commentId, c.liked)}
                    >
                      <Ionicons
                        name="thumbs-up-outline"
                        size={16}
                        color={c.liked ? "#00D282" : "#bbb"}
                      />
                    </TouchableOpacity>
                    <Text style={styles.recommendCount}>{c.likeCount}</Text>
                    {myId && String(c.memberId) === String(myId) && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingCommentId(c.commentId);
                            setEditingText(c.content);
                          }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color="#666"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(c.commentId)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                {editingCommentId === c.commentId ? (
                  <>
                    <TextInput
                      style={styles.commentEditInput}
                      value={editingText}
                      onChangeText={setEditingText}
                      multiline
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAddOrUpdateComment}
                      >
                        <Text style={styles.saveText}>완료</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditingCommentId(null)}
                      >
                        <Text style={styles.cancelText}>취소</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.commentContent}>{c.content}</Text>
                )}
              </View>
            </View>
          ))}
        </KeyboardAwareScrollView>

        {editingCommentId === null && (
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddOrUpdateComment}>
              <Ionicons name="send" size={22} color="#00A86B" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  actions: { flexDirection: "row" },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#222", flexShrink: 1 },
  nickname: { fontSize: 14, color: "#666", marginBottom: 20 },
  content: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 5 },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
    width: "100%",
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  commentBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  commentRight: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#F3F9ED",
    borderRadius: 8,
    padding: 10,
  },
  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentNickname: { fontWeight: "bold", color: "#333" },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  recommendCount: { fontSize: 12, marginHorizontal: 4, color: "#666" },
  commentContent: { fontSize: 14, color: "#000", marginTop: 6 },
  commentInputWrapper: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 15,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#000",
    marginRight: 10,
  },
  commentEditInput: {
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
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelText: { color: "#666" },
  noCommentBox: {
    backgroundColor: "#F3F9ED",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  noCommentText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: "#666",
  },
});
