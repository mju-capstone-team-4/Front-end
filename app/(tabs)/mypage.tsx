import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import UserProfile from "../mypage/UserProfile";
import MyPlant from "../mypage/MyPlant";
import MyPost from "../mypage/MyPost";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* 배경 Ellipse */}
      <LinearGradient
        colors={["#00D282", "#FDDB83"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ellipse}
      />
      <Image
        source={require("@/assets/images/Vector (3).png")}
        style={styles.vector3}
      />
      <Image
        source={require("@/assets/images/Vector (4).png")}
        style={styles.vector4}
      />
      <Image
        source={require("@/assets/images/Vector (5).png")}
        style={styles.vector5}
      />

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <UserProfile />
        <MyPlant />
        <MyPost />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  ellipse: {
    position: "absolute",
    width: scaleWidth(785),
    height: scaleHeight(785),
    top: scaleHeight(-286),
    left: SCREEN_WIDTH / 2 - scaleWidth(785) / 2 - scaleWidth(0.5),
    borderRadius: scaleWidth(785) / 2,
  },
  vector3: {
    position: "absolute",
    top: scaleHeight(0), // -4.91% of 896
    left: SCREEN_WIDTH * 0.01679, // 16.79%
    zIndex: 1,
  },

  vector4: {
    position: "absolute",
    top: scaleHeight(282), // -4.91% of 896
    left: SCREEN_WIDTH * 0.7367, // 16.79%
    zIndex: 1,
  },

  vector5: {
    position: "absolute",
    top: scaleHeight(375), // -4.91% of 896
    left: 36.07, // 16.79%
    zIndex: 1,
  },
  scroll: {
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: "center",
  },
});
