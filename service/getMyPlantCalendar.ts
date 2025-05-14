// service/getMyPlantCalendar.ts
import apiClient from "./apiClient";

export async function getMyPlantCalendar(myPlantId: number) {
  try {
    const response = await apiClient.get(`/mypage/myplant/${myPlantId}`);
    return response.data;
  } catch (error) {
    console.error("❌ 내 식물 달력 조회 실패:", error);
    throw error;
  }
}
