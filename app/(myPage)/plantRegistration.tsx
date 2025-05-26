import React, { useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Switch,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postMyplant } from "@/service/postMyplant";
import axios from "axios";
import { getPlantName } from "@/service/getPlantName";
import DropDownPicker from "react-native-dropdown-picker";
import { postPlantCycle } from "@/service/postPlantCycle";
import * as ImageManipulator from "expo-image-manipulator";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export default function PlantRegistration(): JSX.Element {
  const router = useRouter();

  const [plantNickname, setPlantNickname] = useState("");
  // 물주는 주기는 사용자가 숫자로 입력 (문자열 형태)
  const [wateringFrequency, setWateringFrequency] = useState("");
  // 영양제 사용 여부 (Switch 토글)
  const [useFertilizer, setUseFertilizer] = useState(false);
  // 사용자가 등록한 사진의 URI (선택 사항)
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // DropDownPicker 관련 상태
  const [open, setOpen] = useState(false);
  const [plantOptions, setPlantOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedPlantId, setSelectedPlantId] = useState<number>(0);
  const [plantNameSearch, setPlantNameSearch] = useState("");

  const [manualPlantId, setManualPlantId] = useState("");
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      }
    })();
  }, []);
  useEffect(() => {
    const fetchPlantNames = async () => {
      try {
        if (plantNameSearch.trim() === "") return;
        console.log("👉 검색어:", plantNameSearch); // ✅ 추가
        const data = await getPlantName(plantNameSearch);
        console.log("✅ 식물 이름 응답 데이터:", data); // ✅ 추가
        const options = data.map((plant: any) => ({
          label: plant.name,
          value: plant.plantId,
        }));

        setPlantOptions(options);
        console.log("옵션 :", options);
      } catch (error) {
        console.error("🌱 식물 이름 불러오기 실패:", error);
      }
    };

    const delay = setTimeout(fetchPlantNames, 300);
    return () => clearTimeout(delay);
  }, [plantNameSearch]);

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

      const selectedImage = {
        uri: resized.uri,
        name: "image.jpg",
        type: "image/jpeg",
      };
      setImage(selectedImage); // ✅ 이미지 전송용
      setPhotoUri(resized.uri);
    }
  };

  const handleRegister = async () => {
    if (!plantNickname.trim()) {
      Alert.alert("오류", "식물 별명을 모두 입력해주세요.");
      return;
    }
    // const selectedPlantName =
    //   plantOptions.find((opt) => opt.value === selectedPlantId)?.label ||
    //   plantNameSearch;

    const payload = {
      name: plantNameSearch.trim(),
      description: plantNickname,
      plantId: Number(manualPlantId),
      recommendTonic: useFertilizer,
      image,
    };

    try {
      console.log("📦 요청 데이터:", payload); // ✅ 요청 파라미터 로그

      const response = await postMyplant(payload);
      console.log("✅ 등록 응답:", response);

      const myPlantId = response.data;
      if (!myPlantId) {
        throw new Error("식물 ID를 찾지 못했습니다.");
      }

      await postPlantCycle(myPlantId, Number(wateringFrequency), 12, 30);

      Alert.alert("완료", "식물 등록이 완료되었습니다.");
      router.back();
    } catch (error) {
      console.error("❌ 식물 등록 실패!:", error); // ✅ 에러 전체 출력
      Alert.alert("오류", "식물 등록에 실패했습니다." + String(error));
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>나의 식물 등록</Text>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selectedPlantId}
        setValue={(val) => {
          const newVal = typeof val === "function" ? val(selectedPlantId) : val;
          setSelectedPlantId(newVal);
          setManualPlantId(String(newVal)); // ✅ 드롭다운 선택 시 id 반영
        }}
        items={plantOptions}
        setItems={setPlantOptions}
        searchable={true}
        searchTextInputProps={{
          onChangeText: (text) => setPlantNameSearch(text),
          value: plantNameSearch,
        }}
        placeholder="식물 이름"
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ccc",
          height: 45,
          width: scaleWidth(350),
          marginBottom: 20,
          paddingHorizontal: 12,
          backgroundColor: "#F8F8F8",
          alignSelf: "center",
        }}
        dropDownContainerStyle={{
          borderColor: "#ccc",
          borderRadius: 8,
          marginHorizontal: 16,
          backgroundColor: "#ffffff",
          width: scaleWidth(350),
          alignSelf: "center",
        }}
        textStyle={{
          fontSize: 14,
          color: "#333",
        }}
        placeholderStyle={{
          fontSize: 14,
          color: "#aaa",
        }}
        searchTextInputStyle={{
          height: 38,
          fontSize: 13,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 6,
          paddingHorizontal: 10,
          marginBottom: 6,
        }}
        listItemLabelStyle={{
          fontSize: 13,
          color: "#333",
        }}
        listItemContainerStyle={{
          height: 40,
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="식물 별명"
        value={plantNickname}
        onChangeText={setPlantNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="물주기"
        value={wateringFrequency}
        onChangeText={setWateringFrequency}
      />

      <TouchableOpacity
        style={styles.fertilizerButton}
        onPress={() => setUseFertilizer((prev) => !prev)}
      >
        <Text style={styles.fertilizerButtonText}>
          {useFertilizer ? "영양제 사용 안함" : "영양제 추천 받을래요"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.photoButtonText}>사진 등록 (선택)</Text>
      </TouchableOpacity>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>등록하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // 스크롤 시 등록하기 버튼이 가려지지 않도록 여유 공간 확보
  },
  header: {
    fontFamily: "Pretendard-Bold",
    fontSize: 25,
    marginBottom: 16,
    marginTop: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: scaleWidth(350),
    height: 45,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  recommendButton: {
    backgroundColor: "#6FA46F",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
  },
  recommendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fertilizerButton: {
    backgroundColor: "#FF8C00",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
  },
  fertilizerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#6FA46F",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
