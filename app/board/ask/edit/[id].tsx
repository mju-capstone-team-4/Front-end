import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { updateQuestion } from "../../../../service/updateQuestion";

const icons = {
  WriteIcon: require("../../../../assets/images/write_button.png"),
  PictureIcon: require("../../../../assets/images/picture.png"),
  PlantIcon: require("../../../../assets/images/plant_icon.png"),
};

export default function EditQuestionScreen() {
  const router = useRouter();
  const { id, title, content, imageUrl } = useLocalSearchParams();

  const [newTitle, setNewTitle] = useState(typeof title === "string" ? title : "");
  const [newContent, setNewContent] = useState(typeof content === "string" ? content : "");
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(
    typeof imageUrl === "string"
      ? { uri: imageUrl, name: "origin.jpg", type: "image/jpeg" }
      : null
  );

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

  const handleUpdate = async () => {
    if (!id || typeof id !== "string") {
      Alert.alert("질문 ID가 없습니다.");
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert("입력 필요", "제목과 내용을 입력해주세요.");
      return;
    }

    try {
      await updateQuestion({
        id,
        title: newTitle,
        content: newContent,
        image: image?.uri ? image : undefined,
      });

      Alert.alert("수정 완료", "질문이 성공적으로 수정되었습니다!");
      router.push("/(tabs)/board");
    } catch (error) {
      console.error("❌ 수정 실패:", error);
      Alert.alert("에러", "질문 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 제목 + 수정 버튼 */}
        <View style={styles.header}>
          <Text style={styles.title}>질문 수정</Text>
          <TouchableOpacity onPress={handleUpdate}>
            <Image source={icons.WriteIcon} style={styles.writeButton} />
          </TouchableOpacity>
        </View>

        {/* 안내 문구 */}
        <Text style={styles.uploadGuide}>
          질문 내용에 해당하는 사진을 업로드해주세요
        </Text>

        {/* 사진 업로드 */}
        <TouchableOpacity onPress={pickImage} style={styles.imageIconButton}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          ) : (
            <Image source={icons.PictureIcon} style={styles.pictureButton} />
          )}
        </TouchableOpacity>

        {/* 제목 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>제목</Text>
          </View>
          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={(text) => text.length <= 40 && setNewTitle(text)}
            placeholder="제목을 입력하세요"
            maxLength={40}
          />
          <Text style={styles.charCount}>{newTitle.length}/40</Text>
        </View>

        {/* 내용 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>내용</Text>
          </View>
          <TextInput
            style={[styles.input, { height: 120 }]}
            value={newContent}
            onChangeText={(text) => text.length <= 500 && setNewContent(text)}
            placeholder="내용을 입력하세요"
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{newContent.length}/500</Text>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Pretendard-SemiBold",
  },
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