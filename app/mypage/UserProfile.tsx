import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function UserProfile() {
  // 예시 사용자 데이터 (실제 데이터나 API 연동 시 수정)
  const user = {
    name: "식물이좋아",
    email: "plantlover123@gmail.com",
    profileImage: require("@/assets/images/woman.png"),
  };

  const handleEditProfile = () => {
    console.log("프로필 편집 클릭");
    // 여기서 프로필 편집 화면으로 이동하는 내비게이션 로직 등을 추가할 수 있습니다.
  };

  return (
    <View style={styles.container}>
      <Image source={user.profileImage} style={styles.profileImage} />
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user.name}</Text>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
    marginBottom: 10,
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
  editIcon: {},
  userEmail: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
});
