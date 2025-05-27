import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getMyPlantCalendar } from "@/service/getMyPlantCalendar";
import { useLocalSearchParams } from "expo-router";
import PlantIcon from "@/assets/images/plant.svg";
import Fertilizer from "@/assets/images/fertilizer.svg";
import Water from "@/assets/images/water.svg";

import Pot from "@/assets/images/pot.svg";
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const today = new Date().toISOString().split("T")[0];

export default function PlantDetail() {
  const { id, description, sampleImageUrl } = useLocalSearchParams();
  const [wateringDates, setWateringDates] = useState<string[]>([]);
  const [fertilizingDates, setFertilizingDates] = useState<string[]>([]);
  const [repottingDates, setRepottingDates] = useState<string[]>([]);

  const [nextWateringDate, setNextWateringDate] = useState<string | null>(null);
  const [nextFertilizingDate, setNextFertilizingDate] = useState<string | null>(
    null
  );
  const [nextRepottingDate, setNextRepottingDate] = useState<string | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState<string>(today);
  const getNearestFutureDate = (dates: string[]): string | null => {
    const today = new Date();
    const futureDates = dates
      .map((d) => new Date(d))
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime());

    if (futureDates.length === 0) return null;

    const nextDate = futureDates[0];
    const diffInDays = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `${diffInDays}일 뒤`;
  };
  const getWeekCount = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) ~ 6 (Sat)
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const totalCells = firstDayOfMonth + totalDaysInMonth;
    return Math.ceil(totalCells / 7); // 필요한 주 수
  };
  const getCalendarHeight = (weekCount: number) => {
    const rowHeight = scaleHeight(91); // 각 주차당 높이
    const headerHeight = scaleHeight(70); // 월, 요일, 패딩 포함
    return rowHeight * weekCount + headerHeight;
  };

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        console.log("id :", id);
        console.log("des :", description);
        console.log("image :", sampleImageUrl);

        const data = await getMyPlantCalendar(Number(id));

        setWateringDates(data.wateringDates);
        setFertilizingDates(data.fertilizingDates);
        setRepottingDates(data.repottingDates);

        setNextWateringDate(getNearestFutureDate(data.wateringDates));
        setNextFertilizingDate(getNearestFutureDate(data.fertilizingDates));
        setNextRepottingDate(getNearestFutureDate(data.repottingDates));
      } catch (error) {
        console.error("달력 불러오기 실패", error);
      }
    };

    if (id) fetchCalendar();
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.circle}>
          <Image
            source={require("@/assets/images/flower.png")}
            style={{ width: 50, height: 50 }}
          />
          <Text style={styles.description}>{description}</Text>
          <Image
            source={require("@/assets/images/flower.png")}
            style={{ width: 50, height: 50 }}
          />
        </View>

        <Calendar
          current={currentDate}
          onMonthChange={(date) => {
            setCurrentDate(date.dateString);
          }}
          style={{
            width: scaleWidth(380),
            height: getCalendarHeight(getWeekCount(currentDate)), // 동적 높이 적용
            borderRadius: 25,
            paddingTop: 10,
          }}
          theme={{
            arrowColor: "#00D282",
          }}
          dayComponent={({ date, state }) => {
            if (!date) return null;
            const dateStr = date.dateString;
            const isToday = dateStr === today;
            const isWatering = wateringDates.includes(dateStr);
            const isFertilizing = fertilizingDates.includes(dateStr);
            const isRepotting = repottingDates.includes(dateStr);

            return (
              <View style={{ alignItems: "center", height: scaleHeight(60) }}>
                <Text
                  style={{
                    color: isToday
                      ? "#00D282"
                      : state === "disabled"
                      ? "#ccc"
                      : "#000",
                    fontWeight: isToday ? "bold" : "normal",
                  }}
                >
                  {date.day}
                </Text>

                <View style={{ flexDirection: "row", gap: 4, marginTop: 2 }}>
                  {isWatering && <Water width={18} height={18} />}
                  {isFertilizing && <Fertilizer width={18} height={18} />}
                  {isRepotting && <PlantIcon width={18} height={18} />}
                </View>
              </View>
            );
          }}
          renderHeader={(date) => {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            return (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {year}년 {month}월
              </Text>
            );
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
          }}
        >
          {sampleImageUrl && (
            <Image
              source={require("@/assets/images/retro.png")}
              style={{
                position: "absolute",
                top: -15,
                left: 40,
                width: 50,
                height: 50,
                zIndex: 2,
              }}
            />
          )}
          {sampleImageUrl && (
            <Image
              source={{ uri: String(sampleImageUrl) }}
              style={styles.picture}
            />
          )}
          <View
            style={[
              styles.imageBox,
              !sampleImageUrl && { width: scaleWidth(380) }, // 이미지 없을 때 여백 줄이기
            ]}
          >
            <View style={styles.row}>
              <View style={styles.left}>
                <Water width={25} height={25} />
                <Text style={styles.MainText}>물주기</Text>
              </View>
              <View style={styles.minicircle}>
                <Text style={styles.Text}>
                  {nextWateringDate ?? "정보 없음"}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.left}>
                <Fertilizer width={25} height={25} />
                <Text style={styles.MainText}>영양제</Text>
              </View>
              <View style={styles.minicircle}>
                <Text style={styles.Text}>
                  {nextFertilizingDate ?? "정보 없음"}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.left}>
                <PlantIcon width={25} height={25} />
                <Text style={styles.MainText}>분갈이</Text>
              </View>
              <View style={styles.minicircle}>
                <Text style={styles.Text}>
                  {nextRepottingDate ?? "정보 없음"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },

  container: {
    alignItems: "center",
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
    flexDirection: "row",
    borderRadius: 30,
    marginBottom: 10,
    boxSizing: "border-box",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  minicircle: {
    // width: 60,
    // height: 35,
    // borderRadius: 10,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "#00D282",
  },
  description: {
    color: "black",
    fontFamily: "Pretendard-Light",
    fontSize: 20,
  },

  imageBox: {
    width: scaleWidth(250),
    paddingHorizontal: 10, // 좌우 여백 (선택)
    gap: 10,
    marginTop: 20,
  },
  MainText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
  },
  Text: {
    fontSize: 16,
    fontFamily: "Pretendard-Light",
    color: "#3c3a3f",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 7,
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  picture: {
    width: scaleWidth(150),
    height: scaleHeight(200),
    borderRadius: 18,
  },
});
