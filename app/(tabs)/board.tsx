import { View, Text, StyleSheet } from "react-native";

export default function BoardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>게시판 페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: { fontSize: 20, fontWeight: "bold" },
});
