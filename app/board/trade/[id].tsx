import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import ImageView from "react-native-image-viewing";
import { deleteTradePost } from "../../../service/tradeService";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_BASE = Constants.expoConfig?.extra?.API_URL;
const CHAT_BASE = API_BASE.replace("/api", "");

const icons = {
  WriteIcon: require("../../../assets/images/write_button.png"),
  DeleteIcon: require("../../../assets/images/trash_icon.png"),
};

const [myMemberId, setMyMemberId] = useState<number | null>(null);

useEffect(() => {
  const fetchMemberId = async () => {
    const id = await AsyncStorage.getItem("memberId");
    setMyMemberId(id ? parseInt(id) : null);
  };
  fetchMemberId();
}, []);

export default function TradeDetail() {
  const router = useRouter();
  const {
    id,
    itemName,
    description,
    price,
    imageUrl,
    username, // ✅ 게시글 작성자의 username
    memberId, // ✅ 게시글 작성자의 memberId
  } = useLocalSearchParams();

  const [visible, setVisible] = useState(false);

  const displayTitle = typeof itemName === "string" ? itemName : "제목 없음";
  const displayContent =
    typeof description === "string" ? description : "내용 없음";
  const displayPrice =
    typeof price === "string"
      ? `${parseInt(price).toLocaleString()}원`
      : "가격 미정";
  const validImage = typeof imageUrl === "string" ? imageUrl : undefined;
  const writerUsername = typeof username === "string" ? username : "익명";
  const writerId = typeof memberId === "string" ? parseInt(memberId) : null;

  const handleDelete = async () => {
    if (typeof id !== "string") {
      Alert.alert("오류", "잘못된 게시글 ID입니다.");
      return;
    }

    Alert.alert("삭제 확인", "정말로 이 거래글을 삭제하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTradePost(id);
            Alert.alert("삭제 완료", "거래글이 삭제되었습니다!");
            router.replace("/(tabs)/board");
          } catch (error) {
            Alert.alert("에러", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleChat = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("로그인 필요", "로그인 후 이용해주세요.");
        return;
      }

      if (!writerId || writerId === myMemberId) {
        Alert.alert("알림", "본인과는 채팅할 수 없습니다.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `${CHAT_BASE}/chat/room/private/create?otherMemberId=${writerId}`,
        {},
        { headers }
      );

      const roomId = res.data;
      console.log("✅ 채팅방 생성 성공 - roomId:", roomId);

      router.push({
        pathname: "/chat/[roomId]",
        params: {
          roomId: roomId.toString(),
          partnerName: writerUsername,
          partnerImage: validImage,
        },
      });
    } catch (error) {
      console.error("❌ 채팅방 생성 실패:", error);
      Alert.alert("에러", "채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{displayTitle}</Text>
          {myMemberId === writerId && (
            <View style={styles.iconButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  if (typeof id === "string") {
                    router.push({
                      pathname: "/board/trade/edit/[id]",
                      params: { id, itemName, description, price, imageUrl },
                    });
                  }
                }}
              >
                <Image
                  source={icons.WriteIcon}
                  style={{ width: 32, height: 32 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { marginLeft: 8 }]}
                onPress={handleDelete}
              >
                <Image
                  source={icons.DeleteIcon}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.meta}>작성자: {writerUsername}</Text>
        <Text style={styles.metaPrice}>가격: {displayPrice}</Text>

        {validImage && (
          <>
            <Pressable onPress={() => setVisible(true)}>
              <Image
                source={{ uri: validImage }}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
            <ImageView
              images={[{ uri: validImage }]}
              imageIndex={0}
              visible={visible}
              onRequestClose={() => setVisible(false)}
            />
          </>
        )}

        <Text style={styles.content}>{displayContent}</Text>
      </ScrollView>

      <View style={styles.buttonBox}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
          <Text style={styles.chatButtonText}>💬 채팅하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconButtons: { flexDirection: "row" },
  iconButton: { padding: 4, borderRadius: 6 },
  title: {
    fontSize: 22,
    fontFamily: "Pretendard-SemiBold",
    color: "#222",
    flexShrink: 1,
    marginRight: 10,
  },
  meta: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    color: "#555",
    marginBottom: 4,
  },
  metaPrice: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    color: "#555",
    marginBottom: 16,
  },
  image: {
    width: width - 40,
    height: 250,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "center",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Pretendard-Regular",
    color: "#333",
    marginTop: 12,
  },
  buttonBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  chatButton: {
    backgroundColor: "#00D282",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
  },
});
