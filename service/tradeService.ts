import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function deleteTradePost(id: string) {
  const token = await AsyncStorage.getItem("accessToken");

  const response = await apiClient.delete(`/trade/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`삭제 실패: ${response.status}`);
  }

  return response.data;
}