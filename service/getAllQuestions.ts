// service/getAllQuestions.ts
import apiClient from "./apiClient";

export async function getAllQuestions() {
  try {
    const response = await apiClient.get("/question/all", {
      params: { page: 0, size: 20 },
    });
    if (response.status === 200) {
      console.log("📦 전체 질문 데이터:", response.data); // ✅ 전체 응답 로그
      console.log("📚 질문 리스트 (content):", response.data.content); // ✅ content만 로그
      return response.data.content;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 질문 목록 가져오기 실패:", error);
    throw error;
  }
}
