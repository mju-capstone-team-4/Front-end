import apiClient from "./apiClient";

interface UpdateMyInfoParams {
  username: string;
  email: string;
}

export async function updateMyInfo({ username, email }: UpdateMyInfoParams) {
  try {
    const response = await apiClient.post("/mypage/me", {
      username,
      email,
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("내 정보 변경 실패");
    }
  } catch (error) {
    console.error("❌ 내 정보 변경 실패:", error);
    throw error;
  }
}
