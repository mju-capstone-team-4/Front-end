import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import { getToken } from "./getToken";

interface CreateQuestionParams {
  title: string;
  content: string;
  image?: {
    uri: string;
    type?: string; // 예: "image/jpeg"
    fileName?: string; // 예: "photo.jpg"
  };
}

export async function createQuestion({
  title,
  content,
  image,
}: CreateQuestionParams) {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 이미지가 있을 경우 FormData에 추가 (파일 업로드)
    if (image) {
      formData.append("image", {
        uri: image.uri,
        name: image.fileName || "photo.jpg",
        type: image.type || "image/jpeg",
      } as any);
    }

    // 토큰을 포함한 요청 헤더를 설정하여 POST 요청 전송
    const response = await apiClient.post("/question/create", formData, {
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
    console.error("❌ 질문 생성 실패:", error);
    throw error;
  }
}
