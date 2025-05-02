import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function Layout() {
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
          <Stack.Screen name="bard/ask/new" />
        </Stack>
    </SafeAreaProvider>
  );
}
