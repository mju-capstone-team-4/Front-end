import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

const API_URL = Constants?.expoConfig?.extra?.API_LOGIN_URL;

export const handleOAuthLogin = async (provider: "kakao" | "google") => {
  const redirectUri = Linking.createURL("auth/success");
  const authUrl = `${API_URL}/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`;
  await WebBrowser.openBrowserAsync(authUrl);
};