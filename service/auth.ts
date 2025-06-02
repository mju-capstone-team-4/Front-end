import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_LOGIN_URL;

export const handleOAuthLogin = async (
  provider: "kakao" | "google",
  processToken: (token: string) => Promise<void>
) => {
  const redirectUri = Linking.createURL("auth/success");
  console.log("➡️ redirectUri:", redirectUri);

  const authUrl = `${API_URL}/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`;
  console.log("📡 최종 authUrl:", authUrl);

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "success" && result.url) {
    const parsed = Linking.parse(result.url);
    const accessToken = parsed.queryParams?.accessToken;

    if (typeof accessToken === "string") {
      console.log("✅ accessToken 받음:", accessToken);
      await processToken(accessToken);
    } else {
      console.warn("⚠️ accessToken 없음, URL:", result.url);
    }
  } else {
    console.warn("❌ 로그인 실패 또는 취소됨:", result);
  }
};
