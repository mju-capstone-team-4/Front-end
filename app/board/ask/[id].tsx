import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import React, { useState } from "react";

export default function PostDetail() {
  const { id, title, content, nickname } = useLocalSearchParams();

  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([
    "temp1",
  ]);

  const handleAddComment = () => {
    if (commentInput.trim() === "") return;

    setComments([...comments, commentInput]);
    setCommentInput(""); // 입력창 초기화
  };

  return (
    <View style={styles.container}>
      {/* 게시글 박스 */}
      <View style={styles.postBox}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>작성자: {nickname}</Text>
        <Text style={styles.content}>{content}</Text>
      </View>

      {/* 댓글 영역 */}
      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>💬 댓글</Text>

        {/* 댓글 리스트 */}
        <FlatList
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.commentText}>- {item}</Text>
          )}
        />

        {/* 댓글 입력창 */}
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          value={commentInput}
          onChangeText={setCommentInput}
        />
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
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
    marginBottom: 8,
    borderRadius: 6,
  },
});