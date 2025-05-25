import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/plus.svg";
import PotIcon from "@/assets/images/pot.svg";
import { getMyPlant } from "@/service/getMyPlant";
import { deleteMyPlant } from "@/service/deleteMyPlant";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

interface PlantData {
  name: string;
  description: string;
  wateringFrequency: string;
  photoUri: string;
  useFertilizer: boolean;
  myPlantId: number;
}

export default function MyPlant(): React.JSX.Element {
  const [plants, setPlants] = useState<PlantData[]>([]);

  // 화면이 포커스될 때마다 데이터 불러오기
  useFocusEffect(
    useCallback(() => {
      const fetchPlantData = async () => {
        try {
          const data = await getMyPlant();
          setPlants(data);
          console.log("식물데이터 체크: ", data);
        } catch (error) {
          console.error("데이터 불러오기 오류:", error);
          Alert.alert("오류", "식물 데이터를 불러오지 못했습니다.");
        }
      };

      fetchPlantData();
    }, [])
  );

  // 식물 등록 페이지로 이동
  const handlePlusPress = () => {
    router.push("/plantRegistration");
  };

  const handlePlantPress = (
    myPlantId: number,
    description: string,
    photoUri: string
  ) => {
    console.log("plantId:", myPlantId.toString());

    router.push({
      pathname: "/plantDetail",
      params: { id: myPlantId.toString(), description, photoUri },
    });
  };
  // 지정한 인덱스의 식물을 삭제하는 함수
  const handleDeletePlant = async (myPlantId: number) => {
    // 삭제 전에 사용자에게 확인
    Alert.alert(
      "삭제 확인",
      "정말 이 식물을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("❌ 삭제 요청 plantId:", myPlantId);
              await deleteMyPlant(myPlantId); // ✅ 서버에 삭제 요청
              const updatedPlants = plants.filter(
                (plant) => plant.myPlantId !== myPlantId
              );

              setPlants(updatedPlants); // 상태에서 제거
              Alert.alert("완료", "식물이 삭제되었습니다.");
            } catch (error) {
              console.error("삭제 오류:", error);
              Alert.alert("오류", "식물 데이터를 삭제하는 데 실패했습니다.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // MyPlant.tsx
  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <PotIcon />
        <Text style={styles.title}>나의 식물</Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        {plants.map((plant, index) => (
          <TouchableOpacity
            key={`${plant.description}-${index}`}
            style={styles.plantItem}
            onPress={() =>
              handlePlantPress(
                plant.myPlantId,
                plant.description,
                plant.photoUri
              )
            }
          >
            <View style={styles.itemInfo}>
              <Text style={styles.plantNickname}>{plant.description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeletePlant(plant.myPlantId)}
            >
              <MaterialIcons name="delete" size={24} color="#00D282" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.plusContainer}>
        <TouchableOpacity onPress={handlePlusPress} style={styles.plusButton}>
          <PlusIcon width={scaleWidth(44)} height={scaleHeight(44)} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: scaleWidth(366),
    height: scaleHeight(237),
    backgroundColor: "white",
    shadowColor: "#E4E4E4",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderRadius: 20,
  },
  scrollArea: {
    flex: 1, // ✅ 고정 높이 내에서 스크롤
  },
  titleBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
  },
  title: {
    fontFamily: "Pretendard-Medium",
    textAlign: "left",
    fontSize: 18,
  },
  plusButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  listContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  plantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  itemInfo: {},
  plantNickname: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },
  plantName: {
    fontSize: 14,
    color: "#555",
  },
  plusContainer: {
    position: "relative", // 생략해도 기본값이지만 명시해주는 게 좋음
    alignItems: "center",
  },
});
