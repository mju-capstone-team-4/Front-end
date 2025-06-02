import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export async function predictDisease({
  image,
  description,
  plantName,
}: {
  image: string;
  description: string;
  plantName: string;
}) {
  try {
    const fileName = image.split("/").pop()!;
    const fileType = fileName.split(".").pop() || "jpg";
    const token = await AsyncStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("file", {
      uri: image,
      name: fileName,
      type: `image/${fileType}`,
    } as any);
    formData.append("description", description);
    formData.append("plant", plantName);

    const response = await apiClient.post("/disease/predict", formData, {
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
  } catch (error: any) {
    console.error("❌ 질병 예측 요청 실패:", {
      message: error?.response?.data,
      status: error?.response?.status,
      full: error,
    });
  }
}
