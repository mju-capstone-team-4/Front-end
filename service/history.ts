import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export async function saveDiagnosisHistory(item: {
  image: string;
  result: string;
  confidence: number;
  originalResult: string;
  originalConfidence: number;
}) {
  try {
    const userRes = await apiClient.get("/mypage/me");
    const currentEmail = userRes.data.email;

    const existing = await AsyncStorage.getItem("diagnosisHistory");
    const parsed = existing ? JSON.parse(existing) : [];

    const updated = [
      ...parsed,
      {
        ...item,
        createdAt: new Date().toISOString(),
        userEmail: currentEmail,
      },
    ];

    await AsyncStorage.setItem("diagnosisHistory", JSON.stringify(updated));
  } catch (error) {
    console.error("❌ 진단 히스토리 저장 실패:", error);
    throw error;
  }
}
