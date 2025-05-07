import React, { useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PlantData {
  plantName: string;
  plantNickname: string;
  wateringFrequency: string;
  photoUri: string;
  useFertilizer: boolean;
}

export default function PlantDetail(): JSX.Element {
  const { index } = useLocalSearchParams<{ index: string }>();
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlantData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("myPlantData");
        if (storedData !== null) {
          const parsedData = JSON.parse(storedData);
          const plants = Array.isArray(parsedData) ? parsedData : [parsedData];
          const idx = parseInt(index, 10);
          if (isNaN(idx) || idx < 0 || idx >= plants.length) {
            Alert.alert("오류", "유효하지 않은 식물 인덱스입니다.");
          } else {
            setPlantData(plants[idx]);
          }
        } else {
          Alert.alert("알림", "저장된 식물 데이터가 없습니다.");
        }
      } catch (error) {
        console.error("데이터 불러오기 오류:", error);
        Alert.alert("오류", "식물 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [index]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6FA46F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "left", "right"]}
      ></SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>식물 상세 정보</Text>
        {plantData ? (
          <>
            <Text style={styles.info}>식물 이름: {plantData.plantName}</Text>
            <Text style={styles.info}>
              식물 별명: {plantData.plantNickname}
            </Text>
            <Text style={styles.info}>
              물주는 주기: {plantData.wateringFrequency}일
            </Text>
            <Text style={styles.info}>
              영양제 사용:{" "}
              {plantData.useFertilizer ? "사용 추천" : "사용 비추천"}
            </Text>
            <Image
              source={
                typeof plantData.photoUri === "string"
                  ? { uri: plantData.photoUri }
                  : plantData.photoUri
              }
              style={styles.image}
            />
            <Text style={styles.extra}>
              추가 설명: 여기에 임의의 추가 설명이 들어갑니다.
            </Text>
          </>
        ) : (
          <Text style={styles.error}>식물 데이터를 불러올 수 없습니다.</Text>
        )}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 16,
  },
  extra: {
    fontSize: 14,
    color: "#666",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
});
