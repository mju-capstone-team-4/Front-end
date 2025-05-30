import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import SearchBar from "../book/SearchBar";
import EncyclopediaCard from "../book/EncyclopediaCard";
import { useEffect, useState } from "react";
import { getPlantList, PlantItem } from "@/service/getPlantList";
import { searchPlantByImage } from "@/service/searchPlantByImage";

export default function BookScreen() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지
  const [loading, setLoading] = useState(false); // 중복 요청 방지용
  const [cameraLoading, setCameraLoading] = useState(false);

  // const fetchData = async () => {
  //   try {
  //     const data = await getPlantList(keyword);
  //     setPlants(data);
  //   } catch (e) {
  //     console.error("도감 불러오기 실패", e);
  //   }
  // };
  const fetchData = async (reset = false) => {
    if (loading || isLastPage) return;
    setLoading(true);

    try {
      const nextPage = reset ? 1 : page;
      console.log("📦 요청 페이지:", nextPage, "키워드:", keyword);

      const data = await getPlantList(keyword, nextPage);
      const filteredData = Array.isArray(data) ? data.filter(Boolean) : [];

      // ✅ 마지막 페이지 판별 조건 추가
      if (filteredData.length < 20) {
        setIsLastPage(true);
      }

      if (reset) {
        setPlants(filteredData);
        setPage(2);
      } else {
        setPlants((prev) => [...prev, ...filteredData]);
        setPage((prev) => prev + 1);
      }
    } catch (e) {
      console.error("도감 불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraSearch = () => {
    Alert.alert("이미지 선택", "어떻게 이미지를 가져올까요?", [
      {
        text: "📷 카메라로 촬영",
        onPress: async () => {
          try {
            setCameraLoading(true);
            const plantName = await searchPlantByImage(true); // 카메라 사용
            if (plantName) setKeyword(plantName);
          } catch (error) {
            console.error("이미지 검색 실패 (카메라):", error);
            Alert.alert(
              "검색 실패",
              "촬영한 이미지로 식물을 찾는 데 실패했습니다."
            );
          }
        },
      },
      {
        text: "🖼 갤러리에서 선택",
        onPress: async () => {
          try {
            setCameraLoading(true);

            const plantName = await searchPlantByImage(false); // 갤러리 사용

            if (plantName) setKeyword(plantName);
          } catch (error) {
            console.error("이미지 검색 실패 (갤러리):", error);
            Alert.alert(
              "검색 실패",
              "갤러리 이미지로 식물을 찾는 데 실패했습니다."
            );
          } finally {
            setCameraLoading(false);
          }
        },
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const handleSearch = () => {
    setPage(1);
    setIsLastPage(false);
    setPlants([]);
    fetchData(true); // 키워드로 검색 실행
  };
  return (
    <View style={styles.container}>
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onCameraPress={handleCameraSearch}
        onSearchPress={handleSearch}
      />

      <FlatList
        data={plants}
        keyExtractor={(item, index) => `${item.plantPilbkNo}-${index}`}
        renderItem={({ item }) =>
          item ? (
            <EncyclopediaCard
              imageUrl={item.imageUrl}
              name={item.plantGnrlNm}
              plantPilbkNo={item.plantPilbkNo}
            />
          ) : null
        }
        ListFooterComponent={
          !isLastPage ? (
            <TouchableOpacity onPress={() => fetchData()}>
              <Text style={styles.loadMore}>더보기</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.endText}>모든 데이터를 불러왔습니다</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {cameraLoading && (
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>🔍 검색 중입니다...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginTop: 10,
  },
  loadMore: {
    textAlign: "center",
    padding: 12,
    color: "#00D282",
    fontSize: 16,
  },
  endText: {
    textAlign: "center",
    padding: 12,
    color: "#888",
    fontSize: 14,
  },
  overlay: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // 흐림 효과
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  loadingBox: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
