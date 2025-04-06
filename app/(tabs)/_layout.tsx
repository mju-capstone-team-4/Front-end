import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: true, tabBarStyle: { backgroundColor: "white", height: 60 } }}>
      <Tabs.Screen 
        name="board" 
        options={{ tabBarLabel: '게시판', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="book" 
        options={{ tabBarLabel: '도감', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="diagnosis" 
        options={{ tabBarLabel: '진단',tabBarIcon: ({ color }) => <MaterialCommunityIcons name="leaf" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="chatbot" 
        options={{ tabBarLabel: '채팅',tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="mypage" 
        options={{ tabBarLabel: '내정보', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-box" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}
