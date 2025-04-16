import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getMypage } from "@/service/getMypage";
import { useRouter } from "expo-router";

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
    height: 250,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "blue",
  },
  infoContainer: {
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
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
