import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { allowedPlants } from '@/constants/allowedPlants'; // 진단 가능 식물 목록
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

export default function DiagnosisScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const router = useRouter();
  const API_BASE = Constants.expoConfig?.extra?.API_URL;

  type Plant = {
    // 필요한 식물 정보 타입
    myPlantId: number; // 식물 id
    name: string; // 식물 이름
    status: string; // 식물 상태
    image: string; // 식물 이미지 주소
    description: string; // 식물 설명 
  };

  useEffect(() => {
    fetchMyPlants();
  }, []);

  const fetchMyPlants = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/mypage/myplant`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        console.log("식물 데이터:", data);
        console.log("11111식물 리스트:", plants);
        setPlants(data); // 사용자의 식물 정보 받아오기
      } else {
        console.error("식물 데이터 에러:", data);
        setPlants([]);
      }
    } catch (error) {
      console.error("식물 정보를 불러오기 실패:", error);
      setPlants([]);
    }
  };

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>진단이 필요한 친구를 선택해주세요</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {plants.length === 0 ? (
            <Text style={styles.emptyMessage}>내 식물이 없습니다.</Text>
          ) : (
            plants.map((plant, index) => {
              const isAllowed = allowedPlants.includes(plant.name);
              return (
                <View key={`${plant.myPlantId}-${plant.name || 'unknown'}-${index}`} style={styles.card}>
                  <View style={styles.imageBox}>
                    {plant.image ? (
                      <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
                    ) : (
                      <Text style={styles.imageText}>사진 없음</Text>
                    )}
                  </View>
                  <View style={styles.cardTextBox}>
                    <Text style={styles.plantName}>이름: {plant.name}</Text>
                    <Text style={styles.plantStatus}>설명: {plant.description}</Text>
                    <TouchableOpacity
                      style={isAllowed ? styles.myPlantSelectButton : styles.myPlantSelectButton2}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (isAllowed) {
                          router.push({
                            pathname: '/diagnosis/select',
                            params: { name: plant.name },
                          });
                        }
                      }}
                      disabled={!isAllowed}
                    >
                      <Text style={styles.myPlantSelectButtonText}>
                        {isAllowed ? '선택하기' : '진단 불가'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.selectButton}
            activeOpacity={0.85}
            onPress={() => router.push("/diagnosis/select")}
          >
            <Text style={styles.selectButtonText}>사진으로 진단</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            activeOpacity={0.85}
            onPress={() => router.push("/diagnosis/history")}
          >
            <Text style={styles.historyButtonText}>진단기록 확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    color: "#363636",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 30,
    marginBottom: 8,
  },
  imageBox: {
    width: 180,
    height: 180,
    backgroundColor: "#D4EAE1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    objectFit: "cover",
  },
  imageText: {
    color: "#9E9E9E",
    fontSize: 14,
  },
  cardTextBox: {
    flex: 1,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#363636",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  plantStatus: {
    fontSize: 10,
    color: "#9E9E9E",
    marginBottom: 30,
    textAlign: "center",
  },
  myPlantSelectButton: {
    backgroundColor: "#00D282",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "center",
    textAlign: "center",
  },
  myPlantSelectButton2: {
    backgroundColor: "#9E9E9E",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "center",
    textAlign: "center",
  },
  myPlantSelectButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  selectButton: {
    marginTop: 10,
    backgroundColor: "#00D282",
    padding: 18,
    alignItems: "center",
    borderRadius: 16,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  historyButton: {
    marginTop: 5,
    marginBottom: 30,
    backgroundColor: "#FDDB83",
    padding: 18,
    alignItems: "center",
    borderRadius: 16,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#9E9E9E",
    marginBottom: 30,
  },
  scrollArea: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 12,
    gap: 8,
    marginTop: -15,
    marginBottom: 20,
  },
});
