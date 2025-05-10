// service/updateQuestion.ts
import apiClient from "./apiClient"; // apiClient를 import해야 합니다!!!
import { getToken } from "./getToken"; // 토큰 가져오는 함수도 필요하다면 import!!!

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
  const token = await getToken(); // 토큰을 불러옵니다!!!

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