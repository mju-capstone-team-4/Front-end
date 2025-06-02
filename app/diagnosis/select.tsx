import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import LoadingSplash from "./LoadingSplash";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Back from "@/assets/images/back.svg";
import Camera from "@/assets/images/largecamera.svg";
import Pot from "@/assets/images/pot.svg";
import { allowedPlants } from "@/constants/allowedPlants";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DropDownPicker from "react-native-dropdown-picker";
import { predictDisease } from "@/service/diagnosis";
import { saveDiagnosisHistory } from "@/service/history";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function DiagnosisSelectScreen() {
  useFocusEffect(
    useCallback(() => {
      setDescription("");
      setImage(null);
    }, [])
  );

  const router = useRouter();
  const { name } = useLocalSearchParams();
  const selectedPlantName = Array.isArray(name) ? name[0] : name;
  const isFromMyPlant = !!selectedPlantName;
  const [plantName, setPlantName] = useState<string | null>(
    isFromMyPlant ? selectedPlantName : null
  );
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(plantName);
  const [items, setItems] = useState(
    allowedPlants.map((name) => ({ label: name, value: name }))
  );

  const handleImageSelect = () => {
    Alert.alert("사진 선택", "촬영 또는 갤러리에서 선택하세요", [
      { text: "카메라 촬영", onPress: takePhoto },
      { text: "갤러리에서 선택", onPress: pickImage },
      { text: "취소", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert("이미지를 선택해주세요!");
      return;
    }
    if (!plantName || !allowedPlants.includes(plantName)) {
      Alert.alert("식물을 선택해주세요!");
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const result = await predictDisease({ image, description, plantName });

      if (!result || typeof result.result !== "string") {
        throw new Error("❌ 예측 결과가 없습니다.");
      }

      const predictedPlant = result.result.includes("_")
        ? result.result.split("_")[0]
        : null;
      const isMismatch =
        plantName && predictedPlant && plantName !== predictedPlant;

      await saveDiagnosisHistory({
        image,
        result: isMismatch ? "진단 실패" : result.result,
        confidence: isMismatch ? 0 : result.confidence,
        originalResult: result.result,
        originalConfidence: result.confidence,
      });

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }

      router.push({
        pathname: "/diagnosis/result",
        params: {
          image,
          result: result.result,
          confidence: result.confidence,
          diseaseInfo: result.diseaseInfo,
          watering: result.watering,
          environment: result.environment,
          nutrition: result.nutrition,
          plantName,
        },
      });
    } catch (error) {
      console.error("❌ 진단 요청 실패:", error);
      Alert.alert("진단 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSplash />;

  return (
    <SafeAreaViewContext
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/header.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              {isFromMyPlant && plantName ? `${plantName}` : "식물 진단"}
            </Text>
          </View>
        </View>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={150}
          enableOnAndroid={true}
        >
          <Text style={styles.mainText}>
            사진으로 식물의{"\n"}상태를 진단해보세요
          </Text>

          <TouchableOpacity onPress={handleImageSelect}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.imageBox}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={["#00D282", "#FDDB83"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.imageBox}
              >
                <Camera />
              </LinearGradient>
            )}
          </TouchableOpacity>

          {!isFromMyPlant && (
            <View style={styles.dropdownContainer}>
              <View style={styles.plant}>
                <Pot />
                <Text style={styles.dropdownLabel}>식물 선택</Text>
              </View>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  const val = callback(value);
                  setValue(val);
                  setPlantName(val);
                }}
                setItems={setItems}
                placeholder="식물을 선택하세요"
                style={{
                  borderColor: "#ccc",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                  borderRadius: 8,
                }}
                listMode="MODAL"
              />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Pot />
              <Text style={styles.sectionTitle}>부가 설명</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="작성 시 진단 정확도가 올라갑니다"
              placeholderTextColor="#9E9E9E"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>진단하기</Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewContext>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  circle: {
    flexDirection: "row",
    borderRadius: 30,
    marginBottom: 10,
    boxSizing: "border-box",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    width: 150,
    height: 40,
    borderColor: "white",
  },
  header: {
    alignItems: "center",
    height: scaleHeight(90),
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  headerTitle: {
    fontFamily: "Pretendard-Bold",
    color: "#FFFFFF",
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    backgroundColor: "white",
  },
  mainText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  imageBox: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#D4EAE1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  section: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#eeeeee",
    padding: 16,
    borderRadius: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  titleContainer: {
    paddingVertical: 10,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
    resizeMode: "contain",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
  },
  input: {
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Pretendard-ExtraBold",
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  dropdownContainer: {
    width: "100%",
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownItemSelected: {
    backgroundColor: "#00D282",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#363636",
  },
  plant: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
    marginLeft: 15,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#00D282",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#363636",
    backgroundColor: "#fff",
    paddingRight: 30, // to ensure the text is never behind the icon
    fontFamily: "Pretendard-Medium",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#363636",
    backgroundColor: "#fff",
    paddingRight: 30,
    fontFamily: "Pretendard-Medium",
  },
  iconContainer: {
    top: 15,
    right: 10,
  },
};
