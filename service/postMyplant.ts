// service/postMyPlant.ts
import apiClient from "./apiClient";

interface postMyplantParams {
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
}: postMyplantParams) {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("plantId", String(plantId));
  formData.append("recommendTonic", String(recommendTonic));

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
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ 식물 등록 실패:", error);
    throw error;
  }
}
