import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function NewPostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    // 게시글 데이터 생성
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      nickname: "익명", // 기본 닉네임
      asking: "true",
    };

    // 돌아가면서 새 글 데이터 전달
    router.push({
      pathname: "/(tabs)/board",
      params: newPost,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>질문 게시판</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>제목</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="제목을 입력하세요" />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={content}
        onChangeText={setContent}
        placeholder="내용을 입력하세요"
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 6 , marginTop: 30,},
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  header:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
  }
});