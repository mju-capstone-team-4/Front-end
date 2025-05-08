// service/createTrade.ts
import apiClient from "./apiClient";
import { getToken } from "./getToken";

export interface CreateTradeParams {
  itemName: string;
  description: string;
  price: number;
  image?: {
    uri: string;
    type?: string;
    fileName?: string;
  };
}

export async function createTrade({ itemName, description, price, image }: CreateTradeParams) {
  try {
    const token = await getToken();

    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("description", description);
    formData.append("price", price.toString());

    if (image) {
      formData.append("image", {
        uri: image.uri,
        name: image.fileName || "photo.jpg",
        type: image.type || "image/jpeg",
      } as any);
    }

    const response = await apiClient.post("/trade/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (err) {
    console.error("❌ 거래글 생성 실패:", err);
    throw err;
  }
}