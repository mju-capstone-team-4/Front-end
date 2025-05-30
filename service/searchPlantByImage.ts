// src/service/searchPlantByImage.ts
import * as ImagePicker from "expo-image-picker";
import apiClient from "./apiClient";
import { Platform } from "react-native";

export async function searchPlantByImage(
  useCamera: boolean
): Promise<string | null> {
  const permission = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert(
      useCamera ? "카메라 권한이 필요합니다." : "갤러리 접근 권한이 필요합니다."
    );
    return null;
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

  if (result.canceled || !result.assets?.[0]) return null;

  const image = result.assets[0];

  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    name: image.fileName || `photo.jpg`,
    type: "image/jpeg",
  } as any);

  const response = await apiClient.post("/plant/search/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.plantName;
}
