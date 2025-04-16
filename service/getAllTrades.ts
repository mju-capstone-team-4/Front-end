import apiClient from "./apiClient";

export async function getAllTrades() {
  try {
    const response = await apiClient.get("/trade/all", {
      params: { page: 0, size: 20 },
    });
    if (response.status === 200) {
      return response.data.content;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 거래 목록 가져오기 실패:", error);
    throw error;
  }
}
