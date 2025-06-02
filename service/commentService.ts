import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export async function fetchComments(questionId: string) {
  const token = await AsyncStorage.getItem("accessToken");
  const response = await apiClient.get(`/question/${questionId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.content || [];
}

export async function addOrUpdateComment(
  questionId: string,
  comment: string,
  commentId?: number
) {
  const token = await AsyncStorage.getItem("accessToken");
  const url = commentId
    ? `/comment/${commentId}`
    : `/question/${questionId}/comment`;
  const method = commentId ? "PUT" : "POST";

  await apiClient.request({
    url,
    method,
    headers: { Authorization: `Bearer ${token}` },
    data: { comment },
  });
}

export async function deleteComment(commentId: number) {
  const token = await AsyncStorage.getItem("accessToken");
  await apiClient.delete(`/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function toggleLike(commentId: number, liked: boolean) {
  const token = await AsyncStorage.getItem("accessToken");
  const method = liked ? "DELETE" : "POST";
  await apiClient.request({
    url: `/comments/${commentId}/likes`,
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
}
