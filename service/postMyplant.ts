import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

interface PostMyplantParams {
  name: string;
  description: string;
  plantId: number;
  recommendTonic: boolean;
  image?: {
    uri: string;
    type?: string;
    fileName?: string;
  };
}

export async function postMyplant({
  name,
  description,
  plantId,
  recommendTonic,
  image,
}: PostMyplantParams) {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("plantId", plantId.toString());
    formData.append("recommendTonic", recommendTonic.toString());

    if (image) {
      formData.append("image", {
        uri: image.uri, // e.g. file:///...
        name: image.fileName,
        type: image.type,
      } as any); // Expo에서는 Blob/File 대신 any로 강제 형변환
    }

    const response = await apiClient.post("/mypage/myplant", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ 식물 등록 실패:", error);
    throw error;
  }
}
