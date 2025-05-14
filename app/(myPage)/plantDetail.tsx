// import { View, Text, StyleSheet, ScrollView } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { getMyPlantCalendar } from "@/service/getMyPlantCalendar";

// export default function PlantDetail() {
//   const { index } = useLocalSearchParams(); // id는 문자열로 들어옴
//   const [calendarData, setCalendarData] = useState<any[]>([]);
//   useEffect(() => {
//     console.log(
//       "📅 calendarData changed:\n",
//       JSON.stringify(calendarData, null, 2)
//     );
//   }, [calendarData]);

//   useEffect(() => {
//     const fetchCalendar = async () => {
//       try {
//         const data = await getMyPlantCalendar(Number(index));
//         setCalendarData(data);
//       } catch (err) {
//         console.error("❌ 달력 데이터 불러오기 실패:", err);
//       }
//     };

//     if (index) fetchCalendar();
//   }, [index]);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>🌱 식물 ID: {index}</Text>
//       {calendarData.length > 0 ? (
//         calendarData.map((item, idx) => (
//           <View key={idx} style={styles.entry}>
//             <Text>
//               {item.date} - {item.description}
//             </Text>
//           </View>
//         ))
//       ) : (
//         <Text style={styles.empty}>데이터 없음</Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
//   entry: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//   },
//   empty: {
//     marginTop: 20,
//     textAlign: "center",
//     color: "#999",
//   },
// });

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { getMyPlantCalendar } from "@/service/getMyPlantCalendar";
import { useLocalSearchParams } from "expo-router";

export default function PlantDetail() {
  const { id } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    console.log("id는?", id);
    const fetchCalendar = async () => {
      try {
        const data = await getMyPlantCalendar(Number(id));

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
      <Calendar markedDates={markedDates} markingType="multi-dot" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
