import apiClient from "./apiClient";

export async function getToken(email: string) {
  try {
    const response = await apiClient.post("/mypage/token", { email });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 테스트 유저 토큰 가져오기 실패:", error);
    throw error;
  }
}
