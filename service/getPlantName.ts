import apiClient from "./apiClient";

export async function getPlantName(plantName: string) {
  try {
    const response = await apiClient.get("/mypage/plants", {
      params: { plantName },
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 식물 이름 가져오기 실패:", error);
    throw error;
  }
}
