import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getAllQuestions } from "../../service/getAllQuestions";
import { getAllTrades } from "../../service/getAllTrades";
import { getMyQuestions } from "@/service/getMyQuestion";
import { getMyTrades } from "@/service/getMyTrade";

const icons = {
  ChevronIcon: require("../../assets/images/chevron.png"),
};

// (import 부분은 그대로 유지)

export default function postAll() {
  const [asking, setAsking] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    asking ? fetchQuestions() : fetchTrades();
  }, [asking]);

  const fetchQuestions = async () => {
    try {
      const data = await getMyQuestions(0, 50);
      setQuestions(data.content || []);
    } catch (error) {
      console.error("❌ 질문 목록 가져오기 실패:", error);
    }
  };

  const fetchTrades = async () => {
    try {
      const data = await getMyTrades(0, 50);
      setTrades(data.content || []);
    } catch (error) {
      console.error("❌ 거래 목록 가져오기 실패:", error);
    }
  };

  const filteredData = asking
    ? questions.filter(
        (item) =>
          typeof item.title === "string" &&
          item.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : trades.filter((item) => {
        const name = item?.itemName ?? "";
        return name.toLowerCase().includes(searchText.toLowerCase());
      });

  const renderQuestionItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/board/ask/[id]",
          params: {
            id: item.questionId,
            title: item.title,
            content: item.content,
            nickname: item.username, // ✅ username으로 수정
            imageUrl: item.image_url, // ✅ image_url로 수정
          },
        })
      }
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.content}
        </Text>
      </View>
      <Image source={icons.ChevronIcon} style={styles.chevron} />
    </TouchableOpacity>
  );

  const renderTradeItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/board/trade/[id]",
          params: {
            id: item.tradePostId,
            itemName: item.itemName,
            description: item.description,
            nickname: item.username,
            price: item.price,
            imageUrl: item.imageUrl,
          },
        })
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.itemName}</Text>
        <Text style={styles.cardSubtitle}>{item.price.toLocaleString()}원</Text>
      </View>
      <Image source={icons.ChevronIcon} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* 상단 */}
          <View style={styles.header}>
            <Text style={styles.title}>나의 게시글</Text>
            <View style={styles.icons}>
              <TouchableOpacity
                onPress={() => setSearchVisible(!searchVisible)}
              ></TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push(asking ? "/board/ask/new" : "/board/trade/new");
                }}
              ></TouchableOpacity>
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

          {/* 탭 */}
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => setAsking(true)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  asking && styles.activeTabText,
                  { fontFamily: "Pretendard-Regular" },
                ]}
              >
                질문 게시판
              </Text>
              {asking && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAsking(false)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  !asking && styles.activeTabText,
                  { fontFamily: "Pretendard-Regular" },
                ]}
              >
                거래 게시판
              </Text>
              {!asking && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>

          {/* 리스트 */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) =>
              `${asking ? item.questionId : item.tradePostId}`
            }
            renderItem={asking ? renderQuestionItem : renderTradeItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Pretendard-SemiBold",
  },
  icons: {
    flexDirection: "row",
    gap: 12,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  searchInput: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 30,
  },
  tab: {
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    color: "#00D282",
    fontWeight: "bold",
  },
  underline: {
    marginTop: 4,
    height: 2,
    backgroundColor: "#00D282",
    width: "100%",
  },
  list: {
    marginTop: 10,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 10,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ccc",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: "#666",
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: "#999",
  },
});
