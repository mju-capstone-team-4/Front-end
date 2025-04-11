import { Stack } from "expo-router";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*  (root) 폴더에 있는 index.tsx를 Stack에서 관리 */}
      <Stack.Screen name="(root)/index" />

      {/*  Tabs를 Stack 내부에서 렌더링 */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
