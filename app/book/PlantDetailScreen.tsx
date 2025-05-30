// src/app/book/PlantDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getPlantDetail, PlantDetailItem } from "@/service/getPlantDetail";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PlantDetailScreen() {
  const { plantPilbkNo } = useLocalSearchParams();
  const [plant, setPlant] = useState<PlantDetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 요청하는 plantPilbkNo:", plantPilbkNo);

        const data = await getPlantDetail(Number(plantPilbkNo));
        setPlant(data);
      } catch (error) {
        console.error("🌱 상세 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    if (plantPilbkNo) fetchData();
  }, [plantPilbkNo]);

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 100 }}
        size="large"
        color="#00D282"
      />
    );
  }

  if (!plant) {
    return (
      <Text
        style={{
          fontFamily: "Pretendard-Light",
          alignSelf: "center",
          marginTop: SCREEN_HEIGHT / 2,
        }}
      >
        식물 정보를 불러올 수 없습니다.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: plant.imageUrl }} style={styles.image} />
      <Text style={styles.label}>학명</Text>
      <Text style={styles.title}>{plant.plantGnrlNm}</Text>

      <Text style={styles.label}>학명</Text>
      <Text style={styles.text}>{plant.plantSpecsScnm}</Text>

      <Text style={styles.label}>과</Text>
      <Text style={styles.text}>{plant.familyKorNm}</Text>

      <Text style={styles.label}>속</Text>
      <Text style={styles.text}>{plant.genusKorNm}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
    color: "#00D282",
    fontFamily: "Pretendard-Bold",
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    fontFamily: "Pretendard-Light",
  },
});
