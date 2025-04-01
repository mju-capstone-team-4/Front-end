import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BoardScreen() {
  const [asking, setAsking] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const convert_ask = () => setAsking(true);
  const convert_trade = () => setAsking(false);

  type Question = { title: string; content: string; nickname: string };
  type Trade = { title: string; content: string; nickname: string; price: string };

  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [trades, setTrades] = useState<Record<string, Trade>>({});

  const router = useRouter();
  const params = useLocalSearchParams();

  const ASK_STORAGE_KEY = "@ask";
  const TRADE_STORAGE_KEY = "@trade";

  const handledIds = useRef<Set<string>>(new Set());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const ask_storage = await AsyncStorage.getItem(ASK_STORAGE_KEY);
      const trade_storage = await AsyncStorage.getItem(TRADE_STORAGE_KEY);

      if (ask_storage) setQuestions(JSON.parse(ask_storage));
      if (trade_storage) setTrades(JSON.parse(trade_storage));

      setIsDataLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const { id, title, content, nickname, asking, price } = params;

    if (
      typeof title === "string" &&
      typeof content === "string" &&
      typeof nickname === "string" &&
      typeof asking === "string"
    ) {
      const newId = typeof id === "string" ? id : Date.now().toString();

      if (
        (asking === "true" && questions[newId]) ||
        (asking !== "true" && trades[newId])
      ) return;

      const save = async () => {
        if (asking === "true") {
          const newQuestions = {
            ...questions,
            [newId]: { title, content, nickname },
          };
          setQuestions(newQuestions);
          await AsyncStorage.setItem(ASK_STORAGE_KEY, JSON.stringify(newQuestions));
        } else {
          const newTrades = {
            ...trades,
            [newId]: {
              title,
              content,
              nickname,
              price: typeof price === "string" ? price : "미정",
            },
          };
          setTrades(newTrades);
          await AsyncStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(newTrades));
        }
      };
      save();
    }
  }, [params, isDataLoaded]);

  const filteredData = asking
    ? Object.entries(questions)
        .map(([id, item]) => ({ id, ...item }))
        .filter((item) => item.title.includes(searchText))
    : Object.entries(trades)
        .map(([id, item]) => ({ id, ...item }))
        .filter((item) => item.title.includes(searchText));

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
              if (asking) {
                router.push("/board/ask/new" as const);
              } else {
                router.push("/board/trade/new" as const);
              }
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
        <TouchableOpacity onPress={convert_ask}>
          <Text style={[styles.tabText, asking && styles.activeTab]}>질문 게시판</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={convert_trade}>
          <Text style={[styles.tabText, !asking && styles.activeTab]}>거래 게시판</Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 리스트 (고정된 구조 사용) */}
      {/* 게시글 리스트 - 검색 중이면 결과만, 아니면 전체 리스트 */}
{searchVisible ? (
  <FlatList
    data={filteredData}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: asking ? "/board/ask/[id]" : "/board/trade/[id]",
            params: item,
          })
        }
      >
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{item.title}</Text>
          {!asking && (
            <Text style={styles.priceText}>💰 {(item as any).price}</Text>
          )}
        </View>
      </TouchableOpacity>
    )}
    contentContainerStyle={styles.list}
  />
) : (
  asking ? (
    <FlatList
      data={Object.entries(questions).map(([id, item]) => ({ id, ...item }))}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/board/ask/[id]",
              params: item,
            })
          }
        >
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
    />
  ) : (
    <FlatList
      data={Object.entries(trades).map(([id, item]) => ({ id, ...item }))}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/board/trade/[id]",
              params: item,
            })
          }
        >
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{item.title}</Text>
            <Text style={styles.priceText}>💰 {item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
    />
  )
)}
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
  questionBox: {
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 14,
    marginTop: 8,
    color: "#333",
  },
});