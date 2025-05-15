import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { getMypage } from "@/service/getMypage";

const SERVER_URL = 'ws://15.164.198.69:8080';

type Props = {
  roomId: string;
  partnerName: string;
  partnerImage: string;
};

type ChatMessage = {
  senderEmail: string;
  message: string;
  timestamp?: string;
  isRead?: boolean;
};

export default function UserChat({ roomId, partnerName, partnerImage }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [myEmail, setMyEmail] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const API_BASE = Constants.expoConfig?.extra?.API_URL;
  const CHAT_BASE = API_BASE.replace("/api", "");

  // JWT에서 이메일 추출
  const getMyEmailFromToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      return decoded.sub || decoded.email || null;
    } catch (err) {
      console.error('JWT 디코딩 실패:', err);
      return null;
    }
  };

  // 내 이메일 가져오기
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const me = await getMypage();
        setMyEmail(me.username); // 혹은 me.email, 백엔드 반환값에 따라
        console.log("📩 내 이메일:", me.username);
      } catch (err) {
        console.error("❌ 이메일 가져오기 실패:", err);
      }
    };
    fetchEmail();
  }, []);

  // 메시지 히스토리 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${CHAT_BASE}/chat/history/${roomId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('히스토리 로딩 실패:', err);
      }
    };
    fetchHistory();
  }, [roomId]);

  // STOMP 연결 및 수신 처리
  useEffect(() => {
    const setupStomp = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const wsUrl = `${SERVER_URL}/connect?token=${token}`;

      const client = new Client({
        webSocketFactory: () => new WebSocket(wsUrl), 
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ STOMP 연결 완료');
          client.subscribe(`/topic/${roomId}`, (message) => {
            const newMsg = JSON.parse(message.body);
            console.log("📩 수신된 메시지:", newMsg);
            setMessages((prev) => [...prev, newMsg]);
          });
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 오류 발생:", frame);
        },
        debug: (str) => {
          console.log("🐛 STOMP 디버그:", str);
        },
      });

      client.activate();
      stompClientRef.current = client;

      return () => {
        client.deactivate();
        console.log("🛑 STOMP 연결 종료");
      };
    };

    setupStomp();
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    console.log("🚀 전송 시도:", input);

    const connected = stompClientRef.current?.connected;
    const client = stompClientRef.current;
    console.log("📡 STOMP 연결 상태:", connected);
    console.log("👤 내 이메일:", myEmail);

    if (!input.trim() || !connected || !myEmail) {
      console.warn("⚠️ 메시지 전송 조건 불충분. 전송 중단.");
      return;
    }

    const messageDto = {
      senderEmail: myEmail,
      message: input,
    };

    try {
      client?.publish({
        destination: `/publish/${roomId}`,
        body: JSON.stringify(messageDto),
      });
      console.log("✅ 메시지 publish 완료:", messageDto);
    } catch (err) {
      console.error("❌ 메시지 publish 실패:", err);
    }

    setMessages((prev) => [
      ...prev,
      { ...messageDto, timestamp: new Date().toISOString() },
    ]);
    setInput('');
  };

  // 타임스탬프 포맷
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    return `${period} ${hour12}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: partnerImage }} style={styles.avatar} />
        <Text style={styles.name}>{partnerName}</Text>
        <Text style={styles.name2}>  님과의 대화</Text>
      </View>

      {/* 메시지 영역 */}
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatContainer}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderEmail === myEmail;
          console.log(`💬 렌더링 메시지[${idx}]:`, msg.message, '| from:', msg.senderEmail, '| isMe:', isMe);

          return (
            <View
              key={idx}
              style={[
                styles.messageBubble,
                isMe ? styles.myBubble : styles.otherBubble,
              ]}
            >
              {!isMe && <Text style={styles.sender}>{msg.senderEmail}</Text>}
              <Text style={styles.message}>{msg.message}</Text>
              {msg.timestamp && (
                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)} {isMe && (msg.isRead ? '✓✓' : '✓')}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* 입력창 */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="메시지를 입력하세요"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: 'white' }}>전송</Text>
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
    padding: 12
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#00D282',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  back: {
    fontSize: 22,
    color: '#FFFFFF',
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  name2: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: '75%',
  },
  myBubble: {
    backgroundColor: '#D4EAE1',
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: '#D9D9D9',
    alignSelf: 'flex-start',
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#363636',
  },
  message: {
    fontSize: 15,
  },
  timestamp: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#D9D9D9',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#00D282',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
