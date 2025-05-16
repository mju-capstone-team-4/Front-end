import apiClient from "./apiClient";

export async function deleteMyPlant(myPlantId: number) {
  try {
    const response = await apiClient.delete(`/mypage/myplant/${myPlantId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 내 식물 삭제 실패:", error);
    throw error;
  }
}
