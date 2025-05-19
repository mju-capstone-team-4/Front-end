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
import * as ImageManipulator from "expo-image-manipulator";

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
    profileUrl: string;
    plants: any[];
  } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<any>(null);

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

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const finalImage = {
        uri: resized.uri,
        fileName: "image.jpg",
        type: "image/jpeg",
      };

      setImage(finalImage);
      await uploadProfileImage(finalImage);
    }
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
      // 🔄 상태에서 직접 이미지 URI 갱신
      if (user) {
        setUser({ ...user, profileUrl: image.uri });
      }

      Alert.alert("✅ 변경 완료", "프로필 이미지가 변경되었습니다.");
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
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                user.profileUrl && user.profileUrl.trim() !== ""
                  ? { uri: user.profileUrl }
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
