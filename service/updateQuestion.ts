// service/updateQuestion.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient"; // apiClient를 import해야 합니다!!!

export async function updateQuestion({
  id,
  title,
  content,
  image,
}: {
  id: string;
  title?: string;
  content?: string;
  image?: {
    uri: string;
    name: string;
    type: string;
  };
}) {
  const token = await AsyncStorage.getItem("accessToken");

  const formData = new FormData();
  if (title) formData.append("title", title);
  if (content) formData.append("content", content);
  if (image) {
    formData.append("image", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);
  }

  const response = await apiClient.put(`/question/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // axios는 .data에 응답 내용이 들어있습니다!!!
}
