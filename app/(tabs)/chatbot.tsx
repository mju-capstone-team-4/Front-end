import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getMypage } from "@/service/getMypage";
import DefaultImage from "../../assets/images/plantylogo.svg";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const cardMargin = 12;
const cardWidth = (screenWidth - cardMargin * 3) / 2;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function ChatbotScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [myInfo, setMyInfo] = useState<{ memberId: number; username: string }>({
    memberId: -1,
    username: "",
  });
  const router = useRouter();

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

  const CHAT_BASE = API_BASE.replace("/api", "");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const me = await getMypage();
        setMyInfo({ memberId: me.id, username: me.username });
        console.log("🙋‍♂️ 현재 사용자 정보:", me);

        console.log("📡 사용자 조회 API 호출:", `${API_BASE}/mypage/members`);
        const res = await axios.get(`${API_BASE}/mypage/members`, { headers });

        const filteredUsers = res.data.content.filter(
          (u: any) => u.id !== me.id
        );
        console.log("✅ 필터링된 사용자 목록:", filteredUsers);
        setUsers(filteredUsers);
      } catch (err: any) {
        console.error("❌ 사용자 목록 또는 내 정보 불러오기 실패:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleUserPressById = async (userId: number) => {
    console.log("👆 유저 클릭됨 - ID:", userId);

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      console.error("❌ 해당 유저를 찾을 수 없습니다:", userId);
      return;
    }

    const token = await AsyncStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log(
      "📡 방 생성 요청 URL:",
      `${API_BASE}/chat/room/private/create?otherMemberId=${userId}`
    );
    console.log("🔐 Authorization 헤더:", headers.Authorization);

    try {
      const res = await axios.post(
        `${CHAT_BASE}/chat/room/private/create?otherMemberId=${userId}`,
        {},
        { headers }
      );

      let roomId;
      if (res.data.exists) {
        roomId = res.data.roomId;
      } else {
        const createRes = await axios.post(
          `${CHAT_BASE}/chat/room/private/create?otherMemberId=${userId}`,
          {},
          { headers }
        );
        roomId = createRes.data;
      }
      console.log("✅ 방 생성 성공 - roomId:", roomId);

      router.push({
        pathname: "/chat/[roomId]",
        params: {
          roomId: roomId.toString(),
          partnerName: targetUser.username,
          partnerImage: targetUser.profileUrl || "../../assets/images/appicon.png",
        },
      });
    } catch (err) {
      console.error("❌ 채팅방 생성 실패:", err);
    }
  };

  return (
    <SafeAreaViewContext
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/header.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tabActive} onPress={() => { }}>
              <Text style={styles.tabTextActive}>거래 채팅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabInactive}
              onPress={() => router.push("/chat/aiChat")}
            >
              <Text style={styles.tabTextInactive}>AI 채팅</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Image
            source={require("../../assets/images/search_button.png")}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="사용자를 검색하세요"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9E9E9E"
          />
        </View>

        <ScrollView contentContainerStyle={styles.userList}>
          {users
            .filter(
              (u) =>
                u.username &&
                u.username.includes(search) &&
                u.id !== myInfo.memberId
            )
            .map((user, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleUserPressById(user.id)}
                style={[styles.userCard, { width: cardWidth }]}
              >
                {user.profileUrl ? (
                  <Image
                    source={{ uri: user.profileUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <DefaultImage width={100} height={100} />
                )}
                <Text style={styles.userName}>{user.username}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    height: scaleHeight(90),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  tabContainer: {
    flexDirection: "row",
  },
  tabActive: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginLeft: 20,
    alignItems: "center",
  },
  tabInactive: {
    flex: 1,
    //backgroundColor: '#00D282',
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  tabTextActive: {
    color: "#00D282",
    fontFamily: "Pretendard-ExtraBold",
  },
  tabTextInactive: {
    color: "#FFFFFF",
    fontFamily: "Pretendard-Medium",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00D282",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginLeft: -5,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    marginLeft: -5,
    color: "#393939",
    fontFamily: "Pretendard-Medium",
  },
  userList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  userCard: {
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    margin: cardMargin / 2,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: "#393939",
    fontFamily: "Pretendard-SemiBold",
  },
});
