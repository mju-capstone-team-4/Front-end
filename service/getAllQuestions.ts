// service/getAllQuestions.ts
import apiClient from "./apiClient";

export async function getAllQuestions() {
  try {
    const response = await apiClient.get("/question/all", {
      params: { page: 0, size: 20 },
    });
    if (response.status === 200) {
      return response.data.content;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 질문 목록 가져오기 실패:", error);
    throw error;
  }
}
