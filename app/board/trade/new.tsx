import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { createTrade } from "@/service/createTrade";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const icons = {
  WriteIcon: require("../../../assets/images/write_button.png"),
  PictureIcon: require("../../../assets/images/picture.png"),
  PlantIcon: require("../../../assets/images/plant_icon.png"),
};

export default function NewTradePostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<any>(null);
  const router = useRouter();

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

  const handlePriceChange = (text: string) => {
    const onlyNumber = text.replace(/[^0-9]/g, "");
    const num = parseInt(onlyNumber || "0", 10);
    if (num <= 10000000) setPrice(num.toString());
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim() || !image) {
      Alert.alert("오류", "모든 항목을 입력해주세요.");
      return;
    }

    try {
      await createTrade({
        itemName: title,
        description,
        price: parseInt(price),
        image,
      });

      Alert.alert("성공", "거래글이 등록되었습니다!");
      router.push("/(tabs)/board");
    } catch (error) {
      console.error("📛 서버 오류:", error);
      Alert.alert("에러", "서버 오류로 등록에 실패했습니다.");
    }
  };

  const numericPrice = parseInt(price || "0", 10);
  const formattedPrice = numericPrice.toLocaleString();

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      extraScrollHeight={50}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>거래 게시글 작성</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Image source={icons.WriteIcon} style={styles.writeButton} />
        </TouchableOpacity>
      </View>

      <Text style={styles.uploadText}>거래와 관련된 사진을 업로드해주세요</Text>

      {!image && (
        <TouchableOpacity onPress={pickImage} style={styles.imageIconButton}>
          <Image source={icons.PictureIcon} style={styles.pictureButton} />
        </TouchableOpacity>
      )}
      {image && (
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        </TouchableOpacity>
      )}

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
        />
        <Text style={styles.charCount}>{title.length}/40</Text>
      </View>

      {/* 가격 입력 */}
      <View style={styles.inputBox}>
        <View style={styles.labelRow}>
          <Image source={icons.PlantIcon} style={styles.labelIcon} />
          <Text style={styles.label}>가격(원)</Text>
        </View>
        <TextInput
          style={styles.input}
          value={formattedPrice}
          onChangeText={handlePriceChange}
          placeholder="예: 10000"
          keyboardType="numeric"
        />
        <Text style={styles.charCount}>{formattedPrice} / 10,000,000</Text>
      </View>

      {/* 내용 입력 */}
      <View style={styles.inputBox}>
        <View style={styles.labelRow}>
          <Image source={icons.PlantIcon} style={styles.labelIcon} />
          <Text style={styles.label}>내용</Text>
        </View>
        <TextInput
          style={[styles.input, { height: 120 }]}
          value={description}
          onChangeText={(text) => text.length <= 500 && setDescription(text)}
          placeholder="내용을 입력하세요"
          multiline
        />
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>
    </KeyboardAwareScrollView>
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
  pictureButton: { width: 140, height: 140 },
  imageIconButton: {
    alignSelf: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  uploadText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
    fontFamily: "Pretendard-Regular",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
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