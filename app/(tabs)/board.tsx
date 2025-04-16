import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import QuestionBox from "../../components/QuestionBox";

export default function BoardScreen() {
  const [asking, setAsking] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [questions, setQuestions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  const router = useRouter();

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        "http://43.201.33.187:8080/api/question/all?page=0&size=20"
      );
      const data = await response.json();
      setQuestions(data.content);
    } catch (error) {
      console.error("❌ 질문 목록 가져오기 실패:", error);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await fetch(
        "http://43.201.33.187:8080/api/trade/all?page=0&size=20"
      );
      const data = await response.json();
      setTrades(data.content);
    } catch (error) {
      console.error("❌ 거래 목록 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    asking ? fetchQuestions() : fetchTrades();
  }, [asking]);

  const filteredData = asking
    ? questions
        .filter((item) => typeof item.title === "string")
        .filter((item) =>
          item.title.toLowerCase().includes(searchText.toLowerCase())
        )
    : trades.filter((item) => {
        const name = item?.itemName ?? "";
        return name.toLowerCase().includes(searchText.toLowerCase());
      });

  return (
    <View style={styles.container}>
      {/* 상단 제목 + 아이콘 */}
      <View style={styles.header}>
        <Text style={styles.title}>모두를 위한 식물</Text>
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => setSearchVisible((prev) => !prev)}
            style={styles.iconButton}
          >
            <Ionicons name="search" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push(asking ? "/board/ask/new" : "/board/trade/new");
            }}
            style={styles.iconButton}
          >
            <Ionicons name="create-outline" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색창 */}
      {searchVisible && (
        <TextInput
          placeholder="검색어를 입력하세요"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      )}

      {/* 탭 메뉴 */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setAsking(true)}>
          <Text style={[styles.tabText, asking && styles.activeTab]}>
            질문 게시판
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAsking(false)}>
          <Text style={[styles.tabText, !asking && styles.activeTab]}>
            거래 게시판
          </Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 리스트 */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) =>
          `${asking ? item.questionId : item.tradePostId}`
        }
        renderItem={({ item }) => (
          <QuestionBox
            title={asking ? item.title : item.itemName}
            price={asking ? undefined : `${item.price.toLocaleString()}원`}
            onPress={() =>
              router.push({
                pathname: asking ? "/board/ask/[id]" : "/board/trade/[id]",
                params: asking
                  ? {
                      id: item.questionId,
                      title: item.title,
                      content: item.content,
                      nickname: item.nickname,
                      imageUrl: item.image_url,
                    }
                  : {
                      id: item.tradePostId,
                      itemName: item.itemName,
                      description: item.description,
                      nickname: item.nickname,
                      price: item.price,
                      imageUrl: item.imageUrl,
                    },
              })
            }
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
  },
  searchInput: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  tabs: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 10,
    gap: 20,
  },
  tabText: {
    fontSize: 16,
    color: "#999",
  },
  activeTab: {
    color: "#000",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  list: {
    paddingTop: 10,
  },
});
