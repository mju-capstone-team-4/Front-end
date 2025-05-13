import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as LinkingModule from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import Constants from "expo-constants";
import { handleOAuthLogin } from "@/service/auth";
import { getToken } from "@/service/getToken";

WebBrowser.maybeCompleteAuthSession();
const API_URL = Constants?.expoConfig?.extra?.API_LOGIN_URL;

// ✅ 글로벌 타입 선언 (global.d.ts에도 있으면 더 좋아요!)
declare global {
  var userInfo: {
    username: string | null;
    memberId: number | null;
  };
}

// ✅ 전역 변수 초기화
global.userInfo = {
  username: null,
  memberId: null,
};

// ✅ 토큰 디코딩 함수
function decodeTokenPayload(token: string) {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const decodedPayload = atob(
      base64Payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(decodedPayload);
    console.log("📦 디코딩된 Payload:", payload);
    return payload;
  } catch (error) {
    console.error("❌ 토큰 디코딩 실패:", error);
    return null;
  }
}

export default function LoginScreen() {
  const router = useRouter();

  const processToken = async (token: string) => {
    await AsyncStorage.setItem("accessToken", token);
    console.log("💾 accessToken 저장 완료");

    const payload = decodeTokenPayload(token);
    if (payload) {
      global.userInfo = {
        username: payload.sub || null, // ✅ sub 값을 username으로 사용
        memberId: payload.memberId || null, // 없는 경우 null 처리
      };
      console.log("👤 사용자 정보:", global.userInfo);
    }

    router.replace("/(tabs)/board");
  };

  useEffect(() => {
    const tryAutoLogin = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        console.log("🔐 저장된 토큰 발견! 자동 로그인 진행");
        await processToken(token);
      } else {
        console.log("🕵️ 저장된 토큰 없음. 수동 로그인 필요");
      }
    };

    //tryAutoLogin();

    const listener = LinkingModule.addEventListener("url", async ({ url }) => {
      console.log("🔗 리디렉션 URL 수신됨:", url);
      const parsed = LinkingModule.parse(url);
      const accessToken = parsed.queryParams?.accessToken;

      if (accessToken) {
        console.log("✅ accessToken 수신:", accessToken);
        await processToken(accessToken as string);
      } else {
        console.log("⚠️ accessToken 없음. 로그인 실패로 간주");
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.centered}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.kakao]}
            onPress={() => handleOAuthLogin("kakao")}
          >
            <Image
              source={require("../../assets/images/kakao.png")}
              style={styles.icon}
            />
            <Text style={styles.kakaoText}>카카오톡 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.google]}
            onPress={() => handleOAuthLogin("google")}
          >
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>구글로 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.test]}
            onPress={async () => {
              const token = await getToken("test1@example.com");
              await AsyncStorage.setItem("accessToken", token);
              console.log("새로 저장됨");
              router.replace("/(tabs)/board");
            }}
          >
            <Text>테스트 계정 1로 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.test]}
            onPress={async () => {
              const token = await getToken("test2@example.com");
              await AsyncStorage.setItem("accessToken", token);
              router.replace("/(tabs)/board");
            }}
          >
            <Text>테스트 계정 2로 시작</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.test]}
            onPress={async () => {
              const token = await getToken("test3@example.com");
              await AsyncStorage.setItem("accessToken", token);
              router.replace("/(tabs)/board");
            }}
          >
            <Text>테스트 계정 3로 시작</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 180,
  },
  buttonContainer: { width: "100%" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  kakao: { backgroundColor: "#FEE500" },
  google: { backgroundColor: "#EA4335" },
  test: { backgroundColor: "white" },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  kakaoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  icon: { width: 24, height: 24 },
});
