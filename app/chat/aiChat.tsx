import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";
if (!API_BASE) {
  console.warn("❗ API_BASE가 정의되어 있지 않습니다.");
}

export default function AiChat() {
  const [messages, setMessages] = useState<
    { from: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    setMessages([
      { from: "ai", text: "식물에 대해 궁금하신 점이 있으신가요?" },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]); // 사용자 메시지
    setInput(""); // 입력창 초기화

    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("🔐 token:", token);
      const res = await axios.post(
        `${API_BASE}/chat/bot/ask`,
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiMessage = res.data.message || "AI 응답 없음";

      setMessages((prev) => [...prev, { from: "ai", text: aiMessage }]);
    } catch (err: any) {
      console.error("AI 응답 실패:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || "죄송해요 다시 시도해주세요";
      setMessages((prev) => [...prev, { from: "ai", text: errorMessage }]);
    }
  };

  return (
    <SafeAreaViewContext
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? Constants.statusBarHeight || 0 : 0
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/header.png")}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={styles.tabInactive}
                onPress={() => router.push("/(tabs)/chatbot")} // 거래 채팅 클릭 시 이동
              >
                <Text style={styles.tabTextInactive}>거래 채팅</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabActive}
                onPress={() => {}} // 현재 화면
              >
                <Text style={styles.tabTextActive}>AI 채팅</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.chatContainer}
            contentContainerStyle={{ paddingBottom: 25 }} // 메시지 박스 공간 확보
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.bubble,
                  msg.from === "user" ? styles.myBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.text}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              value={input}
              onChangeText={setInput}
              style={styles.input}
              placeholder="질문을 입력하세요"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text
                style={{ color: "#FFFFFF", fontFamily: "Pretendard-Medium" }}
              >
                전송
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaViewContext>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
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
    marginRight: 20,
    alignItems: "center",
  },
  tabInactive: {
    flex: 1,
    //backgroundColor: '#00D282',
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  tabTextActive: {
    color: "#00D282",
    fontWeight: "bold",
  },
  tabTextInactive: {
    color: "#FFFFFF",
  },
  bubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: "75%",
  },
  aiBubble: {
    backgroundColor: "#D9D9D9",
    alignSelf: "flex-start",
  },
  myBubble: {
    backgroundColor: "#D4EAE1",
    alignSelf: "flex-end",
  },
  text: {
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#D9D9D9",
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    fontFamily: "Pretendard-Medium",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#00D282",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
