// service/getPlantList.ts
import apiClient from "./apiClient";

export interface PlantItem {
  plantGnrlNm: string;
  familyKorNm: string;
  genusKorNm: string;
  plantPilbkNo: number;
  imgUrl: string;
}

export async function getPlantList(keyword: string = ""): Promise<PlantItem[]> {
  try {
    const res = await apiClient.get(`/plant/search`, {
      params: {
        keyword,
      },
    });

    const items = res.data.response.body.items.item;
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("❌ 도감 데이터 불러오기 실패:", error);
    throw error;
  }
}
