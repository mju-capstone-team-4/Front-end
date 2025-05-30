// service/getPlantDetail.ts
import apiClient from "./apiClient";

export interface PlantDetailItem {
  plantGnrlNm: string;
  plantSpecsScnm: string;
  familyKorNm: string;
  genusKorNm: string;
  imageUrl: string;
  dstrb: string;
  leafDesc: string;
  flwrDesc: string;
  fritDesc: string;
  stemDesc: string;
  rootDesc: string;
  useMthdDesc: string;
  note: string;
  spft: string;
  rrngType: string;
  grwEvrntDesc: string;
  prtcPlnDesc: string;
  [key: string]: any; // 유연성 확보를 위해
}

export async function getPlantDetail(
  plantPilbkNo: number
): Promise<PlantDetailItem> {
  try {
    const response = await apiClient.get(`/plant/search/${plantPilbkNo}`);
    const item = response.data.response.body.item;
    return item;
  } catch (error) {
    console.error("❌ 식물 상세 정보 불러오기 실패", error);
    throw error;
  }
}
