import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

interface PlantData {
  plantName: string;
  plantNickname: string;
  wateringFrequency: string;
  photoUri: string;
  useFertilizer: boolean;
}

export default function MyPlant(): JSX.Element {
  const [plants, setPlants] = useState<PlantData[]>([]);

  // 화면이 포커스될 때마다 데이터 불러오기
  useFocusEffect(
    useCallback(() => {
      const fetchPlantData = async () => {
        try {
          const data = await AsyncStorage.getItem("myPlantData");
          if (data !== null) {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
              setPlants(parsedData);
            } else {
              setPlants([parsedData]);
            }
          } else {
            setPlants([]);
          }
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

  // 지정한 인덱스의 식물을 삭제하는 함수
  const handleDeletePlant = async (index: number) => {
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
              const newPlants = plants.filter((_, i) => i !== index);
              setPlants(newPlants);
              await AsyncStorage.setItem(
                "myPlantData",
                JSON.stringify(newPlants)
              );
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

  const renderPlant = ({ item, index }: { item: PlantData; index: number }) => (
    <View style={styles.plantItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.plantNickname}>
          식물 별명: {item.plantNickname}
        </Text>
        <Text style={styles.plantName}>식물 이름: {item.plantName}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeletePlant(index)}>
        <MaterialIcons name="delete" size={24} color="grey" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 식물</Text>
      <Text style={styles.plusButton} onPress={handlePlusPress}>
        [+]
      </Text>
      {plants.length > 0 ? (
        <FlatList
          data={plants}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderPlant}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text>등록된 식물이 없습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
  plusButton: {
    fontSize: 32,
    color: "#6FA46F",
    textAlign: "center",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  plantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 1,
  },
  plantNickname: {
    fontSize: 16,
    fontWeight: "bold",
  },
  plantName: {
    fontSize: 14,
    color: "#555",
  },
});
