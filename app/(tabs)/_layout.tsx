import { Tabs } from "expo-router";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router"; // (자동 splash 처리용)
import { useEffect } from "react";

const icons = {
  board: require("../../assets/images/board_icon.png"),
  book: require("../../assets/images/book_icon.png"),
  diagnosis: require("../../assets/images/diagnosis_icon.png"),
  chatbot: require("../../assets/images/chatbot_icon.png"),
  mypage: require("../../assets/images/mypage_icon.png"),
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom + 1,
          left: "50%", // 👉 왼쪽 기준 중앙

          backgroundColor: "white",
          borderRadius: 50,
          height: 70,
          shadowColor: "#00D282",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarIcon: ({ focused }) => (
          <Image
            source={icons[route.name as keyof typeof icons]}
            style={{
              width: 30,
              height: 30,
              marginTop: 25,
              tintColor: focused ? "#00D282" : "#B0B0B0",
            }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Tabs.Screen name="board" />
      <Tabs.Screen name="book" />
      <Tabs.Screen name="diagnosis" />
      <Tabs.Screen name="chatbot" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
