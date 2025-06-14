import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as LinkingModule from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import Constants from "expo-constants";
import { handleOAuthLogin } from "@/service/auth";
import { getToken } from "@/service/getToken";
import { LinearGradient } from "expo-linear-gradient";
import Back1 from "@/assets/images/back1.svg";
import Back2 from "@/assets/images/back2.svg";
import Back3 from "@/assets/images/back3.svg";
import { getMypage } from "@/service/getMypage";
console.log("✅ loginScreen 렌더링 시작");

const { width, height } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();
const API_URL = Constants?.expoConfig?.extra?.API_LOGIN_URL;

// ✅ 글로벌 타입 선언 (global.d.ts에도 있으면 더 좋아요!)
// declare global {
//   var userInfo: {
//     username: string | null;
//     memberId: number | null;
//   };
// }

// // ✅ 전역 변수 초기화
// global.userInfo = {
//   username: null,
//   memberId: null,
// };

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
    try {
      await AsyncStorage.setItem("accessToken", token);
      const userInfo = await getMypage(); // ✅ 서버에서 username과 memberId 모두 가져옴

      await AsyncStorage.setItem("username", userInfo.username);
      await AsyncStorage.setItem("memberId", String(userInfo.id));

      console.log("👤 사용자 정보:", userInfo);
      router.replace("/(tabs)/board");
    } catch (error) {
      console.error("❌ 사용자 정보 가져오기 실패:", error);
    }
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
    <LinearGradient
      colors={["#00D282", "#FDDB83"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>Planty</Text>
      <Text style={styles.subtitle}>내 손 안의 반려식물 어플</Text>

      <Back1 style={styles.back1} />
      <Back2 style={styles.back2} />
      <Back3 style={styles.back3} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.kakao]}
          onPress={() => handleOAuthLogin("kakao", processToken)}
        >
          <Image
            source={require("../../assets/images/kakao.png")}
            style={styles.icon}
          />
          <Text style={styles.kakaoText}>카카오톡 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.google]}
          onPress={() => handleOAuthLogin("google", processToken)}
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
            await AsyncStorage.removeItem("accessToken");

            const token = await getToken("test1@gmail.com");
            await AsyncStorage.setItem("accessToken", token);
            processToken(token);
            console.log("새로 저장됨");
            router.replace("/(tabs)/board");
          }}
        >
          <Text>테스트 계정 1로 시작</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "flex-start" },
  title: { fontSize: 50, fontFamily: "Dunkin", color: "#fff", marginTop: 142 },
  subtitle: {
    fontFamily: "Pretendard-Medium",
    color: "white",
    fontSize: 24,
    marginTop: 10,
    marginBottom: 100,
  },

  buttonContainer: { width: "80%" },

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
  back1: {
    position: "absolute",
    top: 0,
    left: width / 15,
  },
  back2: {
    position: "absolute",
    top: height / 3.5,
    right: width / 20,
  },
  back3: {
    position: "absolute",
    top: height / 2.1,
    left: width / 8,
  },
});
