import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { updateTrade } from "../../../../service/updateTrade";

const icons = {
  WriteIcon: require("../../../../assets/images/write_button.png"),
  PictureIcon: require("../../../../assets/images/picture.png"),
  PlantIcon: require("../../../../assets/images/plant_icon.png"),
};

export default function TradeEditScreen() {
  const router = useRouter();
  const { id, itemName, description, price, imageUrl } = useLocalSearchParams();

  const [title, setTitle] = useState(itemName as string);
  const [content, setContent] = useState(description as string);
  const [priceText, setPriceText] = useState(price as string);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(
    imageUrl && typeof imageUrl === "string"
      ? { uri: imageUrl, name: "origin.jpg", type: "image/jpeg" }
      : null
  );

  const pickImage = async () => {
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
    if (!title.trim() || !content.trim() || !priceText.trim()) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요!");
      return;
    }

    const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPrice)) {
      Alert.alert("입력 오류", "가격은 숫자만 입력해주세요!");
      return;
    }

    try {
      await updateTrade({
        id: id as string,
        itemName: title,
        description: content,
        price: numericPrice.toString(),
        image: image?.uri ? image : undefined,
      });

      Alert.alert("수정 완료", "거래글이 성공적으로 수정되었습니다!");
      router.replace("/(tabs)/board");
    } catch (error) {
      console.error("❌ 수정 실패:", error);
      Alert.alert("에러", "거래글 수정 중 오류가 발생했습니다!");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={50} // 💡 키보드 올라올 때 화면 밀어주는 높이 조정
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>거래글 수정</Text>
          <TouchableOpacity onPress={handleUpdate}>
            <Image source={icons.WriteIcon} style={styles.writeButton} />
          </TouchableOpacity>
        </View>

        {/* 이미지 업로드 */}
        <Text style={styles.uploadGuide}>상품 이미지를 업로드해주세요</Text>
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

        {/* 가격 입력 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>가격</Text>
          </View>
          <TextInput
            style={styles.input}
            value={priceText}
            onChangeText={setPriceText}
            placeholder="가격을 입력하세요"
            keyboardType="numeric"
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputBox}>
          <View style={styles.labelRow}>
            <Image source={icons.PlantIcon} style={styles.labelIcon} />
            <Text style={styles.label}>내용</Text>
          </View>
          <TextInput
            style={[styles.input, { height: 100 }]}
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