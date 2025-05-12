// service/updateTrade.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import { getToken } from "./getToken";

interface UpdateTradeParams {
  id: string;
  itemName: string;
  description: string;
  price: string;
  image?: {
    uri: string;
    name: string;
    type: string;
  };
}

export async function updateTrade({
  id,
  itemName,
  description,
  price,
  image,
}: UpdateTradeParams) {
  const token = await AsyncStorage.getItem("accessToken");

  const formData = new FormData();
  formData.append("itemName", itemName);
  formData.append("description", description);
  formData.append("price", price);
  if (image) {
    formData.append("image", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);
  }

  const response = await apiClient.put(`/trade/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
