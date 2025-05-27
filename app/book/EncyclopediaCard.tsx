import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Plus from "@/assets/images/plus.svg";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function EncyclopediaCard({
  imageUrl,
  name,
  plantPilbkNo,
}: {
  imageUrl: string;
  name: string;
  plantPilbkNo: number;
}) {
  console.log("📷", imageUrl, name, plantPilbkNo);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/book/PlantDetailScreen?plantPilbkNo=${plantPilbkNo}`)
      }
      style={styles.card}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(myPage)/plantRegistration",
            params: {
              plantPilbkNo,
              name,
              sampleImageUrl: imageUrl,
            },
          })
        }
        style={{ marginTop: 10 }}
      >
        <Plus />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 10,
    shadowColor: "#E4E4E4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    width: scaleWidth(380),
    height: scaleHeight(378),
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: "95%",
    height: scaleHeight(270),
    backgroundColor: "green",
    marginTop: 9,
    borderRadius: 18,
  },
  name: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
    color: "#363636",
    textAlign: "center",
    fontFamily: "Pretendard-Bold",
  },
});
