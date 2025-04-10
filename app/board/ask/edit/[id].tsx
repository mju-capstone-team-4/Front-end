import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
  } from "react-native";
  import React, { useState } from "react";
  import * as ImagePicker from "expo-image-picker";
  import { useLocalSearchParams, useRouter } from "expo-router";
  
  export default function EditPostScreen() {
    const router = useRouter();
    const { id, title, content, imageUrl } = useLocalSearchParams();
  
    const [newTitle, setNewTitle] = useState(typeof title === "string" ? title : "");
    const [newContent, setNewContent] = useState(typeof content === "string" ? content : "");
    const [image, setImage] = useState<any>(
      typeof imageUrl === "string"
        ? { uri: imageUrl, name: "origin.jpg", type: "image/jpeg" }
        : null
    );
  
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = uri.split("/").pop() || "image.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
  
        setImage({ uri, name: filename, type: mimeType });
      }
    };
  
    const handleUpdate = async () => {
      if (!id) {
        Alert.alert("질문 ID가 없습니다");
        return;
      }
  
      const formData = new FormData();
      if (newTitle.trim()) formData.append("title", newTitle);
      if (newContent.trim()) formData.append("content", newContent);
      if (image?.uri) {
        formData.append("image", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }
  
      try {
        const response = await fetch(`http://54.180.238.252:8080/api/question/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });
  
        const responseText = await response.text(); // 디버깅용
  
        if (!response.ok) {
          console.error("❌ 수정 실패 상태 코드:", response.status);
          console.error("❌ 서버 응답 본문:", responseText);
          throw new Error("수정 실패");
        }
  
        Alert.alert("성공", "질문이 수정되었습니다!");
        router.push("/(tabs)/board");
      } catch (error) {
        console.error("수정 실패:", error);
        Alert.alert("에러", "질문 수정에 실패했습니다.");
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
            value={newTitle}
            onChangeText={setNewTitle}
            maxLength={40}
          />
          <Text style={styles.charCount}>{newTitle.length}/40</Text>
  
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            value={newContent}
            onChangeText={setNewContent}
            maxLength={500}
            multiline
          />
          <Text style={styles.charCount}>{newContent.length}/500</Text>
  
          <Text style={styles.label}>이미지</Text>
          {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>이미지 선택하기</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
            <Text style={styles.submitButtonText}>수정 완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: "#fff",
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 30,
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
    imagePreview: {
      width: "100%",
      height: 200,
      marginTop: 10,
      borderRadius: 8,
    },
    imageButton: {
      marginTop: 12,
      padding: 12,
      backgroundColor: "#3f6cff",
      borderRadius: 6,
      alignItems: "center",
      marginBottom: 20,
    },
    imageButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    submitButton: {
      marginTop: 10,
      backgroundColor: "#00aa55",
      paddingVertical: 14,
      borderRadius: 6,
      alignItems: "center",
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });