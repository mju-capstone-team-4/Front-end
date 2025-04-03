import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NewTradePostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !price.trim()) {
      Alert.alert("오류", "모든 항목을 입력해주세요.");
      return;
    }

    if (title.length > 40) {
      Alert.alert("제한 초과", "제목은 40자 이하로 작성해주세요.");
      return;
    }

    if (content.length > 500) {
      Alert.alert("제한 초과", "내용은 500자 이하로 작성해주세요.");
      return;
    }

    const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPrice)) {
      Alert.alert("가격 오류", "가격은 숫자로 입력해주세요.");
      return;
    }

    if (numericPrice > 10000000) {
      Alert.alert("가격 초과", "가격은 1,000만원 이하로 입력해주세요.");
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      nickname: "익명",
      price: `${numericPrice.toLocaleString()}원`,
      asking: "false",
    };

    router.push({
      pathname: "/(tabs)/board",
      params: newPost,
    });
  };

  // 가격 입력 핸들러
  const handlePriceChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, "");
    const numberValue = parseInt(numbersOnly || "0", 10);

    if (numberValue > 10000000) return;

    setPrice(numberValue.toString());
  };

  const numericPrice = parseInt(price || "0", 10);
  const formattedPrice = numericPrice.toLocaleString();

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
        onChangeText={(text) => {
          if (text.length <= 40) setTitle(text);
        }}
        placeholder="제목을 입력하세요"
        maxLength={40}
      />
      <Text style={styles.charCount}>{title.length}/40</Text>

      <Text style={styles.label}>가격(원)</Text>
      <TextInput
        style={styles.input}
        value={formattedPrice}
        onChangeText={handlePriceChange}
        placeholder="예: 10000원 또는 가격 제안 받습니다"
        keyboardType="numeric"
      />
      <Text style={styles.charCount}>
        {numericPrice.toLocaleString()} / 10,000,000
      </Text>

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={content}
        onChangeText={(text) => {
          if (text.length <= 500) setContent(text);
        }}
        placeholder="내용을 입력하세요"
        multiline
        maxLength={500}
      />
      <Text style={styles.charCount}>{content.length}/500</Text>
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
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  charCount: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginBottom: 10,
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