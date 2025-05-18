// src/app/book/PlantDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getPlantDetail, PlantDetailItem } from "@/service/getPlantDetail";

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
    return <Text>식물 정보를 불러올 수 없습니다.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: plant.imgUrl }} style={styles.image} />
      <Text style={styles.title}>{plant.plantGnrlNm}</Text>
      <Text style={styles.label}>학명:</Text>
      <Text style={styles.text}>{plant.plantSpecsScnm}</Text>

      <Text style={styles.label}>꽃 설명:</Text>
      <Text style={styles.text}>{plant.flwrDesc || "정보 없음"}</Text>

      <Text style={styles.label}>잎 설명:</Text>
      <Text style={styles.text}>{plant.leafDesc || "정보 없음"}</Text>

      <Text style={styles.label}>열매 설명:</Text>
      <Text style={styles.text}>{plant.fritDesc || "정보 없음"}</Text>

      <Text style={styles.label}>서식지:</Text>
      <Text style={styles.text}>{plant.dstrb || "정보 없음"}</Text>

      <Text style={styles.label}>생육 환경:</Text>
      <Text style={styles.text}>{plant.grwEvrntDesc || "정보 없음"}</Text>

      <Text style={styles.label}>이용 방법:</Text>
      <Text style={styles.text}>{plant.useMthdDesc || "정보 없음"}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "#fff",
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
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
});
