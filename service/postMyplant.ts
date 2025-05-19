import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

interface MyPlantPayload {
  image?: {
    uri: string;
    type: string;
    fileName: string;
  };
  name: string;
  description: string;
  plantId: number;
  recommendTonic: boolean;
}

export async function postMyplant({
  image,
  name,
  description,
  plantId,
  recommendTonic,
}: MyPlantPayload) {
  const token = await AsyncStorage.getItem("accessToken");

  const formData = new FormData();

  // ✅ 1. 파일 추가
  if (image) {
    formData.append("file", {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    } as any);
  }

  // ✅ 2. JSON 문자열 형태로 data 필드 추가
  formData.append(
    "data",
    JSON.stringify({
      name,
      description,
      plantId,
      recommendTonic,
    })
  );

  // ✅ 3. API 요청
  const response = await apiClient.post("/mypage/myplant", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
