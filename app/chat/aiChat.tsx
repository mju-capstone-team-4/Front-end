import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AiChat() {
  const [messages, setMessages] = useState<{ from: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const API_BASE = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    setMessages([{ from: 'ai', text: '식물에 대해 궁금하신 점이 있으신가요?' }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text: input }]); // 사용자 메시지
    setInput(''); // 입력창 초기화 

    try {
      const token = await AsyncStorage.getItem('accessToken'); 

      const res = await axios.post(
        `${API_BASE}/chat/bot/ask`,
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      const aiMessage = res.data.message || 'AI 응답 없음';

      setMessages(prev => [...prev, { from: 'ai', text: aiMessage }]);
    } catch (err) {
      console.error('AI 응답 실패:', err);
      setMessages(prev => [...prev, { from: 'ai', text: '죄송해요 다시 시도해주세요' }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabInactive}
            onPress={() => router.push('/(tabs)/chatbot')} // 거래 채팅 클릭 시 이동
          >
            <Text style={styles.tabTextInactive}>거래 채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabActive}
            onPress={() => { }} // 현재 화면
          >
            <Text style={styles.tabTextActive}>AI 채팅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 25 }} // 메시지 박스 공간 확보
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.bubble, msg.from === 'user' ? styles.myBubble : styles.aiBubble]}>
            <Text style={styles.text}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="질문을 입력하세요"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: '#FFFFFF' }}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#00D282',
    paddingTop: 20,
    paddingBottom: 0,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabActive: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    //backgroundColor: '#00D282',
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tabTextActive: {
    color: '#00D282',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: '#FFFFFF',
  },
  bubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '75%',
  },
  aiBubble: {
    backgroundColor: '#D9D9D9',
    alignSelf: 'flex-start',
  },
  myBubble: {
    backgroundColor: '#D4EAE1',
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 15,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#D9D9D9',
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#00D282',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
