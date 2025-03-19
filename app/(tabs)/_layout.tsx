import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { backgroundColor: "white", height: 60 } }}>
      <Tabs.Screen 
        name="board" 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="book" 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="diagnosis" 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="leaf" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="chatbot" 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="mypage" 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-box" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}
