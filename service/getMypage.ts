import apiClient from "./apiClient";

export async function getMypage() {
  try {
    const response = await apiClient.get("/mypage/me");
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 테스트 유저 마이 페이지 가져오기 실패:", error);
    throw error;
  }
}
