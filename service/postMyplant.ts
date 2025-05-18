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
  const token = await AsyncStorage.getItem("accessToken");

  const formData = new FormData();

  // ✅ JSON을 Blob처럼 전달 (서버에서 multipart/form-data의 json 인식 위해)
  formData.append(
    "data",
    JSON.stringify({
      name,
      description,
      plantId,
      recommendTonic,
    }) as any
  ); // string으로도 되면 그대로

  if (image) {
    formData.append("file", {
      uri: image.uri,
      name: image.fileName || "plant.jpg",
      type: image.type || "image/jpeg",
    } as any);
  }

  try {
    const response = await apiClient.post("/mypage/myplant", formData, {
      headers: {
        // Content-Type 자동 설정됨 → 생략!
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ 식물 등록 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 식물 등록 실패:", error);
    throw error;
  }
}
