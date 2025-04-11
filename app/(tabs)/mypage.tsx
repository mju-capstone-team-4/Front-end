import { View, Text, StyleSheet } from "react-native";
import UserProfile from "../mypage/UserProfile";
import MyPlant from "../mypage/MyPlant";
import MyPost from "../mypage/MyPost";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <UserProfile />
      <MyPlant />
      <MyPost />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: { fontSize: 20, fontWeight: "bold" },
});
