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
  const formData = new FormData();

  // ✅ 1. JSON 문자열을 'data'라는 키에 넣는다
  const jsonPayload = {
    name,
    description,
    plantId,
    recommendTonic,
  };
  formData.append("data", JSON.stringify(jsonPayload));

  // ✅ 2. 이미지가 있다면 'file'이라는 키로 추가
  if (image) {
    formData.append("file", {
      uri: image.uri, // e.g. file:///...
      name: image.fileName || "plant.jpg",
      type: image.type || "image/jpeg",
    } as any); // Expo에서는 Blob/File 대신 any로 강제 형변환
  }

  // ✅ 3. axios 전송 (Content-Type은 생략해야 함!)
  const response = await apiClient.post("/mypage/myplant", formData, {
    headers: {
      Accept: "application/json", // 필요시 명시
    },
  });

  return response.data;
}
