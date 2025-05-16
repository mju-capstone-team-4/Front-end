import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import EditButton from "../../assets/images/edit.svg";
import { getMypage } from "@/service/getMypage";
import { postMyProfile } from "@/service/postMyProfile";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function UserProfile() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string;
    profile_uri: string;
    plants: any[];
  } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await getMypage();
      setUser(data);
    } catch (error) {
      console.error("사용자 데이터 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const pickAndUploadImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "앨범 접근 권한이 필요합니다.");
      return;
    }

    Alert.alert("사진 선택", "어디서 가져올까요?", [
      {
        text: "카메라",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            await uploadProfileImage(result.assets[0]);
          }
        },
      },
      {
        text: "앨범",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            await uploadProfileImage(result.assets[0]);
          }
        },
      },
      {
        text: "취소",
        style: "cancel",
      },
    ]);
  };

  const uploadProfileImage = async (image: any) => {
    try {
      await postMyProfile({
        profileImage: {
          uri: image.uri,
          type: image.type || "image/jpeg",
          fileName: image.fileName || "profile.jpg",
        },
      });
      Alert.alert("✅ 변경 완료", "프로필 이미지가 변경되었습니다.");
      fetchUser();
    } catch (error) {
      console.error("프로필 업로드 실패:", error);
      Alert.alert("❌ 실패", "프로필 이미지를 업로드하지 못했습니다.");
    }
  };

  const handleEditProfile = () => {
    router.push("/editProfile");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6FA46F" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>사용자 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileWrapper}>
        <View style={styles.profileBorder}>
          <TouchableOpacity onPress={pickAndUploadImage}>
            <Image
              source={
                user.profile_uri && user.profile_uri.trim() !== ""
                  ? { uri: user.profile_uri }
                  : require("@/assets/images/flower.png")
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user.username}</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <EditButton width={22} height={22} />
          </TouchableOpacity>
        </View>
        <View style={styles.emailContainer}>
          <View style={styles.emailBackground} />
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: scaleHeight(350),
    marginTop: scaleHeight(63),
    position: "relative",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  profileWrapper: {
    position: "absolute",
    top: 0,
    width: scaleWidth(211),
    height: scaleWidth(211),
  },
  profileBorder: {
    width: scaleWidth(211),
    height: scaleWidth(211),
    borderRadius: scaleWidth(211) / 2,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: scaleWidth(197),
    height: scaleWidth(197),
    borderRadius: scaleWidth(197) / 2,
    backgroundColor: "#fff8de",
  },
  infoContainer: {
    position: "absolute",
    alignItems: "center",
    top: scaleHeight(265),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontFamily: "Pretendard-Bold",
    fontSize: scaleWidth(24),
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 5,
  },
  emailContainer: {
    position: "relative",
    width: scaleWidth(154),
    height: scaleHeight(26),
    justifyContent: "center",
    alignItems: "center",
  },
  emailBackground: {
    position: "absolute",
    width: scaleWidth(154),
    height: scaleHeight(26),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 30,
  },
  userEmail: {
    fontFamily: "Pretendard-Medium",
    fontSize: scaleWidth(10),
    lineHeight: scaleHeight(12),
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
