import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Layout() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* (root) 폴더에 있는 index.tsx를 Stack에서 관리 */}
        <Stack.Screen name="(root)/index" />
        <Stack.Screen name="(root)/loginScreen" />

        {/* Tabs를 Stack 내부에서 렌더링 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 추가된 화면들 */}
        <Stack.Screen name="board/ask/[id]" />
        <Stack.Screen name="board/trade/[id]" />
        <Stack.Screen name="board/ask/new" />
      </Stack>
    </SafeAreaProvider>
  );
}
