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
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postMyplant } from "@/service/postMyplant";
import axios from "axios";
import { getPlantName } from "@/service/getPlantName";
import DropDownPicker from "react-native-dropdown-picker";

export default function PlantRegistration(): JSX.Element {
  const router = useRouter();

  const [plantName, setPlantName] = useState("");
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
          value: plant.id,
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

  const handleRecommend = () => {
    const recommended = "3";
    Alert.alert(
      "추천",
      `플랜티가 추천하는 물주는 주기는 ${recommended}일 입니다.`
    );
    setWateringFrequency(recommended);
  };

  const handleFertilizerRecommend = () => {
    const newValue = !useFertilizer;
    setUseFertilizer(newValue);
    Alert.alert(
      "추천",
      newValue
        ? "영양제 사용을 추천합니다."
        : "영양제 사용을 추천하지 않습니다."
    );
  };

  const handlePhotoRegistration = () => {
    Alert.alert(
      "사진 등록",
      "어떤 방식으로 사진을 등록하시겠습니까?",
      [
        {
          text: "카메라",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: "images",
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setPhotoUri(uri);
            }
          },
        },
        {
          text: "앨범",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: "images",
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setPhotoUri(uri);
            }
          },
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // const handleRegister = async () => {
  //   if (
  //     !plantName.trim() ||
  //     !plantNickname.trim() ||
  //     !wateringFrequency.trim()
  //   ) {
  //     Alert.alert("오류", "식물 이름, 별명, 물주는 주기를 모두 입력해주세요.");
  //     return;
  //   }
  //   // 기본 사진은 로컬 이미지로 지정 (require 사용)
  //   const defaultPhotoUri = require("@/assets/images/react-logo.png");
  //   const finalPhotoUri = photoUri ? photoUri : defaultPhotoUri;
  //   console.log("finalPhotoUri:", finalPhotoUri);
  //   const newPlantData = {
  //     plantName,
  //     plantNickname,
  //     wateringFrequency,
  //     useFertilizer,
  //     photoUri: finalPhotoUri,
  //   };

  //   try {
  //     const storedPlantsString = await AsyncStorage.getItem("myPlantData");
  //     let storedPlants = [];
  //     if (storedPlantsString) {
  //       storedPlants = JSON.parse(storedPlantsString);
  //       if (!Array.isArray(storedPlants)) {
  //         storedPlants = [storedPlants];
  //       }
  //     }
  //     storedPlants.push(newPlantData);
  //     await AsyncStorage.setItem("myPlantData", JSON.stringify(storedPlants));
  //     console.log("식물 등록 완료:", storedPlants);
  //     router.back();
  //   } catch (error) {
  //     console.error("저장 오류:", error);
  //     Alert.alert("저장 오류", "식물 데이터를 저장하는 데 실패했습니다.");
  //   }
  // };
  const handleRegister = async () => {
    if (!plantName.trim() || !plantNickname.trim()) {
      Alert.alert("오류", "식물 이름과 별명을 모두 입력해주세요.");
      return;
    }

    try {
      await postMyplant({
        name: plantNameSearch,
        description: plantNickname,
        plantId: selectedPlantId,
        recommendTonic: useFertilizer,
        image: photoUri
          ? {
              uri: photoUri,
              fileName: "photo.jpg",
              type: "image/jpeg",
            }
          : undefined,
      });

      Alert.alert("완료", "식물 등록이 완료되었습니다.");
      router.back();
    } catch (error) {
      Alert.alert("오류", "식물 등록에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>식물 등록</Text>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selectedPlantId}
        setValue={setSelectedPlantId as any}
        items={plantOptions}
        setItems={setPlantOptions}
        searchable={true}
        searchTextInputProps={{
          onChangeText: (text) => setPlantNameSearch(text),
          value: plantNameSearch,
        }}
        placeholder="식물 이름을 검색하거나 선택하세요"
      />
      <TextInput
        style={styles.input}
        placeholder="식물 별명"
        value={plantNickname}
        onChangeText={setPlantNickname}
      />

      <TouchableOpacity
        style={styles.fertilizerButton}
        onPress={() => setUseFertilizer((prev) => !prev)}
      >
        <Text style={styles.fertilizerButtonText}>
          {useFertilizer ? "영양제 사용 안함" : "영양제 추천 받을래요"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.photoButton}
        onPress={handlePhotoRegistration}
      >
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // 스크롤 시 등록하기 버튼이 가려지지 않도록 여유 공간 확보
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
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
