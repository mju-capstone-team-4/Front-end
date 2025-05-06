import { AxiosError } from "axios";
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
    const axiosError = error as AxiosError;

    console.error("❌ 거래 목록 가져오기 실패:", axiosError);

    if (axiosError.config && axiosError.config.headers) {
      console.log("📡 요청 헤더:", axiosError.config.headers); // 👈 여기서 Authorization 확인
    }
    throw error;
  }
}
