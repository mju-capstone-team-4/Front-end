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

export default function NewTradePostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<any>(null);
  const router = useRouter();

  // ✅ 이미지 선택 및 리사이징
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImage({
        uri: resized.uri,
        name: "image.jpg",
        type: "image/jpeg",
      });
    }
  };

  // ✅ 가격 입력
  const handlePriceChange = (text: string) => {
    const onlyNumber = text.replace(/[^0-9]/g, "");
    const num = parseInt(onlyNumber || "0", 10);
    if (num <= 10000000) setPrice(num.toString());
  };

  // ✅ 제출
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim() || !image) {
      Alert.alert("오류", "모든 항목을 입력해주세요.");
      return;
    }

    if (title.length > 40) {
      Alert.alert("제목 제한", "제목은 40자 이하로 작성해주세요.");
      return;
    }

    if (description.length > 500) {
      Alert.alert("내용 제한", "내용은 500자 이하로 작성해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", title);
    formData.append("price", parseInt(price).toString());
    formData.append("description", description);
    formData.append("image", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);

    try {
      const response = await fetch(
        "http://54.180.238.252:8080/api/trade/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("서버 오류");

      const result = await response.json();
      Alert.alert("성공", `거래글이 등록되었습니다!`);
      router.push("/(tabs)/board");
    } catch (error) {
      console.error("📛 서버 오류:", error);
      Alert.alert("에러", "서버 오류로 등록에 실패했습니다.");
    }
  };

  const numericPrice = parseInt(price || "0", 10);
  const formattedPrice = numericPrice.toLocaleString();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            onChangeText={(text) => text.length <= 40 && setTitle(text)}
            placeholder="제목을 입력하세요"
          />
          <Text style={styles.charCount}>{title.length}/40</Text>

          <Text style={styles.label}>가격(원)</Text>
          <TextInput
            style={styles.input}
            value={formattedPrice}
            onChangeText={handlePriceChange}
            placeholder="예: 10000"
            keyboardType="numeric"
          />
          <Text style={styles.charCount}>{formattedPrice} / 10,000,000</Text>

          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            value={description}
            onChangeText={(text) => text.length <= 500 && setDescription(text)}
            placeholder="내용을 입력하세요"
            multiline
          />
          <Text style={styles.charCount}>{description.length}/500</Text>

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
