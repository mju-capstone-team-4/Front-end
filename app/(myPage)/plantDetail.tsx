import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Dimensions, Image } from "react-native";
import { Calendar } from "react-native-calendars";
import { getMyPlantCalendar } from "@/service/getMyPlantCalendar";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Pot from "@/assets/images/pot.svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function PlantDetail() {
  const { id, description } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [nextWateringDate, setNextWateringDate] = useState<string | null>(null);
  const [nextFertilizingDate, setNextFertilizingDate] = useState<string | null>(
    null
  );
  const [nextRepottingDate, setNextRepottingDate] = useState<string | null>(
    null
  );
  const getNearestFutureDate = (dates: string[]): string | null => {
    const today = new Date();
    const futureDates = dates
      .map((d) => new Date(d))
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime());

    if (futureDates.length === 0) return null;

    const nextDate = futureDates[0];
    const formatted = nextDate.toISOString().split("T")[0];
    const diffInDays = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `${formatted} (D-${diffInDays})`;
  };

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        console.log("id :", id);
        console.log("des :", description);

        const data = await getMyPlantCalendar(Number(id));

        setNextWateringDate(getNearestFutureDate(data.wateringDates));
        setNextFertilizingDate(getNearestFutureDate(data.fertilizingDates));
        setNextRepottingDate(getNearestFutureDate(data.repottingDates));

        const marks: any = {};

        data.wateringDates.forEach((date: string) => {
          if (!marks[date]) {
            marks[date] = {
              marked: true,
              dots: [{ color: "#00D282", key: "watering" }],
              markingType: "multi-dot",
            };
          } else {
            marks[date].dots.push({ color: "#00D282", key: "watering" });
          }
        });

        data.repottingDates.forEach((date: string) => {
          if (!marks[date]) {
            marks[date] = {
              marked: true,
              dots: [{ color: "#FFA500", key: "repotting" }],
              markingType: "multi-dot",
            };
          } else {
            marks[date].dots.push({ color: "#FFA500", key: "repotting" });
          }
        });

        setMarkedDates(marks);
      } catch (error) {
        console.error("달력 불러오기 실패", error);
      }
    };

    if (id) fetchCalendar();
  }, [id]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#00D282", "#FDDB83"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.rectangle}
      >
        <View style={styles.circle}>
          <Text style={styles.description}>{description}</Text>
        </View>
      </LinearGradient>

      <Calendar
        style={{
          width: scaleWidth(380),
          borderRadius: 20,
        }}
        markedDates={markedDates}
        markingType="multi-dot"
        renderHeader={(date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          return (
            <Text>
              {year}년 {month}월
            </Text>
          );
        }}
      />
      <View style={styles.imageBox}>
        <View style={styles.row}>
          <Image
            source={require("@/assets/images/watering-can.jpg")}
            style={styles.watering}
          />

          <Text style={styles.Text}>{nextWateringDate ?? "정보 없음"}</Text>
        </View>
        <View style={styles.row}>
          <Image
            source={require("@/assets/images/pill.png")}
            style={styles.pill}
          />
          <Text style={styles.Text}>{nextFertilizingDate ?? "정보 없음"}</Text>
        </View>
        <View style={styles.row}>
          <Image
            source={require("@/assets/images/plant-pot.png")}
            style={styles.pot}
          />
          <Text style={styles.Text}>{nextRepottingDate ?? "정보 없음"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  rectangle: {
    width: scaleWidth(785),
    height: 89,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginBottom: 20,
  },
  circle: {
    width: 171,
    height: 51,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    borderRadius: 30,
    boxSizing: "border-box",
    marginTop: 30,
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    color: "white",
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
  },
  watering: {
    width: 35,
    height: 35,
  },
  pill: {
    width: 35,
    height: 35,
  },
  pot: {
    width: 35,
    height: 35,
  },
  imageBox: {
    alignItems: "center",
    alignSelf: "flex-start", // ✅ 왼쪽 정렬
    paddingHorizontal: 30, // 좌우 여백 (선택)
    gap: 10, // 이미지 사이 간격 (React Native >= 0.71에서 지원)
    marginTop: 20,
  },
  Text: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});
