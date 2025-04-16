import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { createQuestion } from "@/service/createQuestion";

export default function NewPostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "권한 필요",
        "이미지를 선택하려면 갤러리 접근 권한이 필요합니다."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      // 이미지 리사이즈 (가로 800px로 줄이기)
      const resized = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileName = resized.uri.split("/").pop() || "image.jpg";
      setImage({
        uri: resized.uri,
        name: fileName,
        type: "image/jpeg",
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !image) {
      Alert.alert("오류", "제목, 내용, 이미지를 모두 입력해주세요.");
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

    try {
      // createQuestion 함수에서 FormData 구성, 토큰 발급, API 호출 등을 처리함
      const result = await createQuestion({ title, content, image });
      Alert.alert("성공", "질문이 등록되었습니다!");
      router.push("/(tabs)/board");
    } catch (error) {
      Alert.alert("에러", "질문 등록에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>질문 게시판</Text>
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

          <Text style={styles.label}>이미지</Text>
          {image && (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          )}
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>이미지 선택하기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 6, marginTop: 30 },
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
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  imageButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#3f6cff",
    borderRadius: 6,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
