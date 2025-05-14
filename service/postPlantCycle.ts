import apiClient from "./apiClient";

export async function postPlantCycle(
  myPlantId: number,
  water: number,
  repot: number,
  fertilize: number
) {
  try {
    const response = await apiClient.post(
      `/mypage/myplant/${myPlantId}/cycling`,
      {
        waterCycle: water,
        repottingCycle: repot,
        fertilizingCycle: fertilize,
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 주기 등록 실패:", error);
    throw error;
  }
}
