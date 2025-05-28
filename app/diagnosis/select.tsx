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
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import LoadingSplash from "./LoadingSplash";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import Back from "@/assets/images/back.svg";
import Camera from "@/assets/images/largecamera.svg";
import Pot from "@/assets/images/pot.svg";
import { allowedPlants } from '@/constants/allowedPlants'; // 진단 가능 식물 목록
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function DiagnosisSelectScreen() {
  useFocusEffect(
    useCallback(() => {
      setDescription("");
      setImage(null);
    }, [])
  ); // 페이지에 다시 진입할 때 입력 내용 초기화

  const router = useRouter();
  const { name } = useLocalSearchParams(); //dianosis.tsx에서 식물 이름 name 받기
  const selectedPlantName = Array.isArray(name) ? name[0] : name;
  const API_BASE = Constants.expoConfig?.extra?.API_URL;
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFromMyPlant = !!selectedPlantName;
  const [plantName, setPlantName] = useState<string | null>(
    isFromMyPlant ? selectedPlantName : null
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
    // 이미지 권한 확인
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

  const handleImageSelect = () => {
    Alert.alert("사진 선택", "촬영 또는 갤러리에서 선택하세요", [
      { text: "카메라 촬영", onPress: takePhoto },
      { text: "갤러리에서 선택", onPress: pickImage },
      { text: "취소", style: "cancel" },
    ]);
  };

  const saveToHistory = async (item: {
    image: string;
    result: string;
    confidence: number;
    originalResult: string;
    originalConfidence: number;
  }) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userRes = await fetch(`${API_BASE}/mypage/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = await userRes.json();
      const currentEmail = currentUser.email;

      const existing = await AsyncStorage.getItem("diagnosisHistory");
      const parsed = existing ? JSON.parse(existing) : [];

      const updated = [
        ...parsed,
        {
          result: item.result,
          confidence: item.confidence,
          image: item.image,
          createdAt: new Date().toISOString(),
          originalResult: item.originalResult,
          originalConfidence: item.originalConfidence,
          userEmail: currentEmail, // 사용자 구분
        },
      ];
      await AsyncStorage.setItem("diagnosisHistory", JSON.stringify(updated));
    } catch (e) {
      console.error("로컬 저장 실패:", e);
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

    setIsLoading(true); // 로딩 시작

    // 최소 로딩 시간을 위한 시작 시간 기록
    const startTime = Date.now();

    const fileName = image.split("/").pop(); // 이미지 이름 추출
    const fileType = fileName?.split(".").pop() || "jpg"; // 이미지 타입 추출

    const token = await AsyncStorage.getItem("accessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const formData = new FormData();
    formData.append("file", {
      uri: image, // 이미지 파일 경로
      name: fileName, // 업로드될 파일의 이름
      type: `image/${fileType}`,
    } as any);

    formData.append("description", description);
    formData.append("plant", selectedPlantName);

    try {
      const response = await fetch(`${API_BASE}/disease/predict`, {
        //백엔드 ip
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(response.status, errorText); // 에러 체크
        return;
      }

      const result = await response.json();

      const predictedPlant = result.result.includes("_")
        ? result.result.split("_")[0]
        : null;
      const isMismatch =
        plantName && predictedPlant && plantName !== predictedPlant;

      console.log("📦 백엔드 응답 결과:");
      console.log("🧪 진단 결과:", result.result);
      console.log("📊 정확도:", result.confidence);
      console.log("💬 질병 정보:", result.diseaseInfo);
      console.log("💧 수분 관리:", result.watering);
      console.log("🌿 환경 관리:", result.environment);
      console.log("🍽️ 영양 관리:", result.nutrition);

      // 최소 로딩 시간 계산
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 최소 2초

      // 최소 로딩 시간보다 적게 걸렸다면 남은 시간만큼 대기
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }

      await saveToHistory({
        image,
        result: isMismatch ? "진단 실패" : result.result,
        confidence: isMismatch ? 0 : result.confidence,
        originalResult: result.result,
        originalConfidence: result.confidence,
      });

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
          plantName: plantName,
        },
      });
    } catch (error) {
      console.error("진단 요청 실패:", error);
      Alert.alert("진단 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };
  if (isLoading) {
    return <LoadingSplash />;
  }

  return (
    <>
      <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/header.png')}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>{isFromMyPlant && plantName ? `${plantName}` : '식물 진단'}</Text>
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
                <RNPickerSelect
                  onValueChange={(value) => setPlantName(value)}
                  placeholder={{ label: "식물을 선택하세요", value: null }}
                  value={plantName}
                  items={allowedPlants.map((name) => ({
                    label: name,
                    value: name,
                  }))}
                  style={pickerSelectStyles}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => (
                    <Ionicons name="chevron-down" size={20} color="#555" />
                  )}
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
    </>
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
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  titleContainer: {
    paddingVertical: 10,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
