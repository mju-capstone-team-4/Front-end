import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import { getToken } from "./getToken";

export async function deleteQuestion(questionId: string) {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    const response = await apiClient.delete(`/question/${questionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 질문 삭제 실패:", error);
    throw error;
  }
}
