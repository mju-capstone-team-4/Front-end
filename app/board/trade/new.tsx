import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NewTradePostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !price.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      nickname: "익명",
      price,
      asking: "false", // 💥 거래글!
    };

    router.push({
      pathname: "/(tabs)/board",
      params: newPost,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>거래 게시판</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
      />

      <Text style={styles.label}>가격</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="예: 10000원 또는 가격 제안 받습니다"
      />

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
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 30,
  },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
  },
});