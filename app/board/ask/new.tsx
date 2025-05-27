import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createQuestion } from "@/service/createQuestion";

const icons = {
  WriteIcon: require("../../../assets/images/write_button.png"),
  PictureIcon: require("../../../assets/images/picture.png"),
  PlantIcon: require("../../../assets/images/plant_icon.png"),
};

export default function NewPostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);

  const router = useRouter();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "이미지 선택을 위해 갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
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
      Alert.alert("입력 필요", "제목, 내용, 이미지를 모두 입력해주세요.");
      return;
    }

    try {
      await createQuestion({ title, content, image });
      Alert.alert("등록 완료", "질문이 성공적으로 등록되었습니다!");
      router.push("/(tabs)/board");
    } catch (error) {
      Alert.alert("에러", "질문 등록 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={50} // 💡 자연스럽게 올라오도록 조정
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 제목 + 버튼 */}
        <View style={styles.header}>
          <Text style={styles.title}>질문 작성</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Image source={icons.WriteIcon} style={styles.writeButton} />
          </TouchableOpacity>
        </View>

        <Text style={styles.uploadGuide}>질문내용에 해당하는 사진을 업로드해주세요</Text>

        {/* 이미지 업로드 버튼 */}
        <TouchableOpacity onPress={pickImage} style={styles.imageIconButton}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          ) : (
            <Image source={icons.PictureIcon} style={styles.pictureButton} />
          )}
        </TouchableOpacity>

        {/* 제목 입력 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>제목</Text>
          </View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={(text) => text.length <= 40 && setTitle(text)}
            placeholder="제목을 입력하세요"
            maxLength={40}
          />
          <Text style={styles.charCount}>{title.length}/40</Text>
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>내용</Text>
          </View>
          <TextInput
            style={[styles.input, { height: 120 }]}
            value={content}
            onChangeText={(text) => text.length <= 500 && setContent(text)}
            placeholder="내용을 입력하세요"
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: "#fff", flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontFamily: "Pretendard-SemiBold" },
  writeButton: { width: 32, height: 32 },
  uploadGuide: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
    marginBottom: 12,
    color: "#555",
  },
  pictureButton: { width: 140, height: 140 },
  imageIconButton: { alignSelf: "center", marginBottom: 30 },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  inputBox: { marginBottom: 20 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  labelIcon: { width: 15, height: 15 },
  label: { fontSize: 16, fontFamily: "Pretendard-SemiBold" },
  input: {
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    marginBottom: 6,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
});