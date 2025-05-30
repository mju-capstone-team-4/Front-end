// service/getPlantList.ts
import apiClient from "./apiClient";

export interface PlantItem {
  plantGnrlNm: string;
  familyKorNm: string;
  genusKorNm: string;
  plantPilbkNo: number;
  imageUrl: string;
}

export async function getPlantList(
  keyword: string = "",
  page: number = 1
): Promise<PlantItem[]> {
  try {
    const res = await apiClient.get(`/plant/search`, {
      params: {
        keyword: keyword.trim(), // 공백 제거
        page: String(page), // 문자열로 변환
      },
    });

    const items = res.data.response.body.items.item;
    if (!keyword.trim()) {
      console.log("🔍 전체 데이터 요청");
    }

    return Array.isArray(items)
      ? items.filter(Boolean)
      : [items].filter(Boolean);
  } catch (error) {
    console.error("❌ 도감 데이터 불러오기 실패:", error);
    throw error;
  }
}
