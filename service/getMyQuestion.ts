import apiClient from "./apiClient";

export async function getMyQuestions(page: number = 0, size: number = 10) {
  try {
    const response = await apiClient.get(`/question/my`, {
      params: {
        page,
        size,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ 나의 질문 목록 가져오기 실패:", error);
    throw error;
  }
}
