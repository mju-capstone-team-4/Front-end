import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import Constants from "expo-constants";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_IMAGE = require("../../assets/images/appicon.png");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

type DiagnosisHistoryItem = {
  result: string;
  confidence: number;
  diseaseInfo: string;
  watering: string;
  environment: string;
  nutrition: string;
  image?: string | null;
  originalResult?: string;
  originalConfidence?: number;
  createdAt?: string | null;
  userEmail: string;
};

export default function DiagnosisHistoryScreen() {
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DiagnosisHistoryItem | null>(
    null
  );
  const router = useRouter();

  /*const fetchAndMergeHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userRes = await fetch(`${API_BASE}/mypage/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = await userRes.json();
      const currentEmail = currentUser.email;

      const response = await fetch(`${API_BASE}/disease/record?page=0&size=10`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const backendData = await response.json();
      const diagnosisList = backendData.content || [];

      //console.log("🛰️ 서버에서 가져온 진단 기록:", diagnosisList);

      const local = await AsyncStorage.getItem('diagnosisHistory');
      const allLocalHistory = local ? JSON.parse(local) : [];
      const localHistory = allLocalHistory.filter((item: DiagnosisHistoryItem) => item.userEmail === currentEmail);

      //console.log("💾 로컬에 저장된 진단 기록:", localHistory);

      const merged = diagnosisList.map((item: DiagnosisHistoryItem) => {
        const matched = localHistory.find((localItem: DiagnosisHistoryItem) =>
          localItem.originalResult === item.result &&
          Math.abs((localItem.originalConfidence ?? 0) - item.confidence) < 0.00001
        );

        return {
          ...item,
          result: matched?.result === '진단 실패' ? '진단 실패' : item.result,
          confidence: matched?.result === '진단 실패' ? 0 : (matched?.confidence ?? item.confidence),
          image: matched?.image ?? null,
          createdAt: matched?.createdAt ?? null,
        };
      });

      setHistory(merged);
    } catch (error) {
      console.error('진단 기록 병합 실패:', error);
      Alert.alert('진단 기록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };*/

  const fetchAllHistoryFromAPI = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      let allRecords: DiagnosisHistoryItem[] = [];
      let currentPage = 0;
      let totalPages = 1;

      while (currentPage < totalPages) {
        const response = await fetch(
          `${API_BASE}/disease/record?page=${currentPage}&size=10&sort=createdAt,desc`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.content) {
          allRecords = [...allRecords, ...data.content];
        }

        totalPages = data.totalPages ?? 1;
        currentPage++;
      }

      console.log("🧾 전체 진단 기록 개수:", allRecords.length);
      setHistory(allRecords);
    } catch (error) {
      console.error("❌ 전체 진단 기록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseResult = (fullResult: string | null | undefined) => {
    if (!fullResult || typeof fullResult !== "string") {
      return { plant: "알 수 없음", disease: "알 수 없음" };
    }

    if (!fullResult.includes("_")) {
      return { plant: "알 수 없음", disease: fullResult };
    }

    const [plant, ...diseaseParts] = fullResult.split("_");
    return {
      plant,
      disease: diseaseParts.join("_"),
    };
  };

  useEffect(() => {
    fetchAllHistoryFromAPI();
    //fetchAndMergeHistory();
  }, []);

  return (
    <SafeAreaViewContext
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "bottom"]}
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
          <Text style={styles.headerTitle}>진단 기록</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D282" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 ? (
            <Text style={styles.emptyText}>진단 이력이 없습니다.</Text>
          ) : (
            history.map((item: DiagnosisHistoryItem, index: number) => {
              const { plant, disease } = parseResult(item.result);

              return (
                <View key={index} style={styles.card}>
                  <Image
                    source={item.image ? { uri: item.image } : DEFAULT_IMAGE}
                    style={styles.image}
                  />
                  <Text style={styles.cardPlantName}>{plant}</Text>
                  <Text style={styles.cardPlantDisease}>{disease}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedItem(item)}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>상세 정보 보기</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!selectedItem}
        //transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.resultLabel}>진단 결과</Text>
              <Text style={styles.resultValue}>{selectedItem?.result}</Text>
              <Text style={styles.resultLabel}>정확도</Text>
              <Text style={styles.resultValue}>
                {((selectedItem?.confidence ?? 0) * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultLabel}>질병 정보</Text>
              <Text style={styles.resultValue}>
                {selectedItem?.diseaseInfo}
              </Text>
              <Text style={styles.resultLabel}>수분 관리</Text>
              <Text style={styles.resultValue}>{selectedItem?.watering}</Text>
              <Text style={styles.resultLabel}>환경 관리</Text>
              <Text style={styles.resultValue}>
                {selectedItem?.environment}
              </Text>
              <Text style={styles.resultLabel}>영양 관리</Text>
              <Text style={styles.resultValue}>{selectedItem?.nutrition}</Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setSelectedItem(null)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  header: {
    height: scaleHeight(90),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  backButton: {
    position: "absolute",
    left: 10,
    padding: 8,
    zIndex: 1,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Pretendard-ExtraBold",
  },
  card: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  cardPlantName: {
    fontSize: 16,
    color: "#000000",
    marginTop: 10,
    fontFamily: "Pretendard-ExtraBold",
  },
  cardPlantDisease: {
    fontSize: 14,
    color: "#363636",
    textAlign: "left",
    fontFamily: "Pretendard-Medium",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
  },
  detailButton: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#00D282",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Pretendard-ExtraBold",
  },
  textBox: {
    padding: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: "#000000",
    marginTop: 10,
    fontFamily: "Pretendard-ExtraBold",
  },
  resultValue: {
    fontSize: 14,
    color: "#363636",
    textAlign: "left",
    fontFamily: "Pretendard-Medium",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#9E9E9E",
    marginTop: 40,
    fontFamily: "Pretendard-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalCloseButton: {
    width: "100%",
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#00D282",
    borderRadius: 20,
  },
  modalCloseText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Pretendard-ExtraBold",
  },
});
