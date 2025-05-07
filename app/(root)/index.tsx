import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Linking,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as LinkingModule from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { handleOAuthLogin } from "@/service/auth";
import { getToken } from "@/service/getToken";

// 추가할 거 자동로그인

WebBrowser.maybeCompleteAuthSession();
const API_URL = Constants?.expoConfig?.extra?.API_LOGIN_URL;

export default function LoginScreen() {
  const router = useRouter();
  console.log("일단 여기 들어옴");

  useEffect(() => {
    const listener = LinkingModule.addEventListener("url", async ({ url }) => {
      console.log("🔗 리디렉션 URL 수신됨:", url);
      const parsed = LinkingModule.parse(url);
      const accessToken = parsed.queryParams?.accessToken;

      if (accessToken) {
        console.log("✅ accessToken 수신:", accessToken);
        await AsyncStorage.setItem("accessToken", accessToken as string);
        console.log("💾 accessToken 저장 완료");
        router.replace("/(tabs)/board");
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
            style={[styles.button, { backgroundColor: "#999" }]}
            onPress={async () => {
              const token = await getToken();
              if (token) {
                await AsyncStorage.setItem("accessToken", token);
                console.log("✅ 테스트 토큰 저장 완료:", token);
                router.replace("/(tabs)/board");
              } else {
                console.log("⚠️ 테스트 토큰을 받지 못했습니다.");
              }
            }}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              테스트 계정으로 시작
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 180,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  google: {
    backgroundColor: "#EA4335",
  },
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
  icon: {
    width: 24,
    height: 24,
  },
});
