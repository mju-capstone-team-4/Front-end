import axios from "axios";
import apiClient from "./apiClient";

export async function getMyPlant() {
  try {
    const response = await apiClient.get("/mypage/myplant");
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 나의 식물 가져오기 실패:", error);

    throw error;
  }
}
