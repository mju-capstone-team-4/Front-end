import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

export default function TradeEdit() {
  const router = useRouter();
  const {
    id,
    itemName,
    description,
    price,
    imageUrl,
  } = useLocalSearchParams();

  const [title, setTitle] = useState(itemName as string);
  const [content, setContent] = useState(description as string);
  const [priceText, setPriceText] = useState(price as string);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(
    imageUrl && typeof imageUrl === "string"
      ? {
          uri: imageUrl,
          name: "image.jpg",
          type: "image/jpeg",
        }
      : null
  );
  useEffect(() => {
    console.log("🪵 수정 중인 질문 ID:", id);
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop() || "image.jpg";
      const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
      setImage({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      });
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !priceText.trim()) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요!");
      return;
    }

    const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPrice)) {
      Alert.alert("입력 오류", "가격은 숫자만 입력해주세요!");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", title);
    formData.append("description", content);
    formData.append("price", numericPrice.toString());
    if (image?.uri && image.uri !== imageUrl) {
      formData.append("image", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    }

    try {
      const response = await fetch(`http://43.201.33.187:8080/api/trade/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("서버 오류");

      Alert.alert("수정 완료", "거래 게시글이 수정되었습니다!");
      router.replace("/(tabs)/board");
    } catch (error) {
      Alert.alert("에러", "거래글 수정에 실패했습니다!");
      console.error("❌ 수정 실패:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(text) => {
            if (text.length <= 40) setTitle(text);
          }}
          placeholder="제목을 입력하세요"
        />
        <Text style={styles.charCount}>{title.length}/40</Text>

        <Text style={styles.label}>가격</Text>
        <TextInput
          style={styles.input}
          value={priceText}
          onChangeText={setPriceText}
          placeholder="가격을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>내용</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={content}
          onChangeText={(text) => {
            if (text.length <= 500) setContent(text);
          }}
          placeholder="내용을 입력하세요"
          multiline
        />
        <Text style={styles.charCount}>{content.length}/500</Text>

        <Text style={styles.label}>이미지</Text>
        {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>이미지 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUpdate} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>수정 완료</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
  },
  charCount: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  preview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  imageButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#4a90e2",
    borderRadius: 6,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#00aa55",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});