import { View, Text, StyleSheet, FlatList } from "react-native";
import SearchBar from "../book/SearchBar";
import EncyclopediaCard from "../book/EncyclopediaCard";
import { useEffect, useState } from "react";
import { getPlantList, PlantItem } from "@/service/getPlantList";

export default function BookScreen() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const fetchData = async () => {
    try {
      const data = await getPlantList(keyword);
      setPlants(data);
    } catch (e) {
      console.error("도감 불러오기 실패", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword]); // 키워드가 바뀔 때마다 검색 실행
  return (
    <View style={styles.container}>
      <SearchBar value={keyword} onChange={setKeyword} />
      <FlatList
        style={{
          marginBottom: 71,
        }}
        data={plants}
        keyExtractor={(item) => item.plantPilbkNo.toString()}
        renderItem={({ item }) => (
          <EncyclopediaCard
            imageUrl={item.imgUrl}
            name={item.plantGnrlNm}
            plantPilbkNo={item.plantPilbkNo}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
