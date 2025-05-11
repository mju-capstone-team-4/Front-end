import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getMypage } from "@/service/getMypage";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
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

  const handleEditProfile = () => {
    console.log("프로필 편집 클릭");
    // 여기서 프로필 편집 화면으로 이동하는 내비게이션 로직 등을 추가할 수 있습니다.
  };
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getMypage();
        setUser(data);
        //console.log("사용자 데이터:", data);
      } catch (error) {
        console.error("사용자 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);
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
      <Image source={{ uri: user.profileUrl }} style={styles.profileImage} />
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user.username}</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <MaterialIcons
              name="edit"
              size={20}
              color="#777"
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 290,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    marginTop: scaleHeight(63),
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
  profileImage: {
    position: "absolute",
    width: scaleWidth(211),
    height: scaleWidth(211), // 정사각형이므로 width 기준
    top: 0,
    left: SCREEN_WIDTH / 2 - scaleWidth(211) / 2, // 가운데 정렬
    borderRadius: scaleWidth(211) / 2,
    backgroundColor: "#D9D9D9", // 로딩 전 배경
    zIndex: 2,
  },
  infoContainer: {
    position: "absolute",
    alignItems: "center",
    backgroundColor: "blue",
    top: scaleHeight(286),
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
  },
  editIcon: {
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "black",
    marginTop: 4,
  },
});
