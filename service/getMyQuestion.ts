import apiClient from "./apiClient";

export async function getMyQuestions(page: number = 0, size: number = 10) {
  try {
    const response = await apiClient.get(`/question/my`, {
      params: {
        page,
        size,
      },
    });

    const reversedData = response.data.content.reverse();

    // 그대로 content만 return하거나 전체 response.data를 유지할지에 따라 달라짐
    return {
      ...response.data,
      content: reversedData,
    };
  } catch (error) {
    console.error("❌ 나의 질문 목록 가져오기 실패:", error);
    throw error;
  }
}
