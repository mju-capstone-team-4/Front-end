import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { updateMyInfo } from "@/service/updateMyInfo";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const router = useRouter();

  const [username, setUsername] = useState("");

  const handleUpdate = async () => {
    if (!username.trim()) {
      Alert.alert("오류", "새로운 이름을 입력해주세요.");
      return;
    }

    try {
      await updateMyInfo({ username });
      Alert.alert("성공", "내 정보가 성공적으로 변경되었습니다.");
      router.back(); // 뒤로 이동
    } catch (error) {
      Alert.alert("실패", "정보 변경에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 수정</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>수정 완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#00D282",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
