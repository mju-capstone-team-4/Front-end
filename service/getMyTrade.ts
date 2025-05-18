import apiClient from "./apiClient";

export async function getMyTrades(page: number = 0, size: number = 10) {
  try {
    const response = await apiClient.get(`/trade/my`, {
      params: {
        page,
        size,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ 나의 거래 목록 가져오기 실패:", error);
    throw error;
  }
}
