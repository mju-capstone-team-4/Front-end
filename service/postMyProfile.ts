import apiClient from "./apiClient";

interface PostMyProfileParams {
  profileImage?: {
    uri: string;
    type?: string;
    fileName?: string;
  };
}

export async function postMyProfile({ profileImage }: PostMyProfileParams) {
  const formData = new FormData();

  if (profileImage) {
    formData.append("file", {
      uri: profileImage.uri,
      name: profileImage.fileName || "profile.jpg",
      type: profileImage.type || "image/jpeg",
    } as any);
  }

  try {
    const response = await apiClient.post("/mypage/me/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ 프로필 업로드 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 프로필 업로드 실패:", error);
    throw error;
  }
}
