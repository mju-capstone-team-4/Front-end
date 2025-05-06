import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const listener = Linking.addEventListener("url", async ({ url }) => {
      console.log("✅ [Layout] 리디렉션 URL 감지됨:", url);

      const parsed = Linking.parse(url);
      const accessToken = parsed.queryParams?.accessToken;
      console.log("📦 [Layout] parsed:", parsed);

      if (typeof accessToken === "string") {
        console.log("✅ [Layout] accessToken 수신:", accessToken);
        await AsyncStorage.setItem("accessToken", accessToken);
        console.log("💾 [Layout] accessToken 저장 완료");
        router.replace("/(tabs)/board");
      } else {
        console.log("❌ [Layout] accessToken 없음");
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* (root) 폴더에 있는 index.tsx를 Stack에서 관리 */}
        <Stack.Screen name="(root)/index" />

        {/* Tabs를 Stack 내부에서 렌더링 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 추가된 화면들 */}
        <Stack.Screen name="board/ask/[id]_ask" />
        <Stack.Screen name="board/trade/[id]_ask" />
        <Stack.Screen name="board/ask/new" />
      </Stack>
    </SafeAreaProvider>
  );
}
