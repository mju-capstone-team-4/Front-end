import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  StyleSheet, Image, BackHandler, KeyboardAvoidingView, 
  Platform, Keyboard, Dimensions, } from 'react-native';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { getMypage } from "@/service/getMypage";
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SERVER_URL = 'ws://15.164.198.69:8080';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

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
  const [myName, setMyName] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const API_BASE = Constants.expoConfig?.extra?.API_URL;
  const CHAT_BASE = API_BASE.replace("/api", "");
  const [isConnected, setIsConnected] = useState(false);

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
        const me = await getMypage(); // 이름
        const email = await getMyEmailFromToken(); // 이메일
        setMyName(me.username);
        setMyEmail(email);
        console.log("📩 내 이름:", me.username);
        console.log("📩 내 이메일:", email);
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

        const me = await getMypage();
        const myEmail = me.email;
        const myName = me.username;

        const mapped = res.data.map((msg: ChatMessage) => {
          if (msg.senderEmail?.toLowerCase() === myEmail?.toLowerCase()) {
            return { ...msg, senderEmail: myName }; // ✅ 내 이름으로 강제 변경
          }
          return msg;
        });

        setMessages(mapped);

        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } catch (err) {
        console.error('히스토리 로딩 실패:', err);
      }
    };
    fetchHistory();
  }, [roomId]);

  const subscriptionRef = useRef<any>(null);

  // STOMP 연결 및 수신 처리
  useEffect(() => {
    const setupStomp = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("❌ 토큰이 없습니다. STOMP 연결 중단.");
        return;
      }
      //console.log(token)
      const wsUrl = `${SERVER_URL}/connect?token=${encodeURIComponent(token)}`;

      const client = new Client({
        webSocketFactory: () => new WebSocket(wsUrl),
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ STOMP 연결 완료');
          setIsConnected(true);
          const subscription = client.subscribe(`/topic/${roomId}`, (message) => {
            const newMsg = JSON.parse(message.body);
            console.log("📩 수신된 메시지:", newMsg);
            setMessages((prev) => [...prev, newMsg]);
          });

          subscriptionRef.current = subscription;

        },
        onStompError: (frame) => {
          console.error("❌ STOMP 오류 발생:", frame);
          console.error("↪️ 상세:", frame.body);
        },
        onWebSocketClose: (event) => {
          console.warn("🔌 WebSocket 닫힘:", event.code, event.reason);
          setIsConnected(false);
        },
        onWebSocketError: (event) => {
          console.error("🛑 WebSocket 에러:", event);
        },
        debug: (str) => {
          console.log("🐛 STOMP 디버그:", str);
        },
      });


      client.activate();
      stompClientRef.current = client;

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          console.log("🔕 채팅방 구독 해제");
        }
        stompClientRef.current?.deactivate();
        console.log("🛑 STOMP 연결 종료");
      };
    };
    setupStomp();
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    /*console.log("🚀 전송 시도:", input);

    const connected = stompClientRef.current?.connected;
    console.log("📡 STOMP 연결 상태:", connected);
    console.log("👤 내 이메일:", myEmail);

    if (!input.trim() || !connected || !myEmail) {
      console.warn("⚠️ 메시지 전송 조건 불충분. 전송 중단.");
      return;
    }*/
    const client = stompClientRef.current;

    if (!input.trim() || !stompClientRef.current?.connected || !myName) {
      console.warn("⚠️ 메시지 전송 조건 불충분. 전송 중단.");
      return;
    }

    const messageDto = {
      senderEmail: myName,
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

    /*setMessages((prev) => [
      ...prev,
      { ...messageDto, timestamp: new Date().toISOString() },
    ]);*/
    setInput('');
  };

  useEffect(() => {
    const onBackPress = () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate(); // STOMP 연결 종료
        console.log("🛑 [뒤로가기] STOMP 연결 종료");
      }
      return false; // false면 기본 뒤로가기 작동
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  // 타임스탬프 포맷
  /*const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    return `${period} ${hour12}:${minutes}`;
  };*/

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();  // STOMP 연결 종료
          console.log("🛑 [화면 나감] STOMP 연결 종료");
        }
      };
    }, [])
  );


  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });
    return () => showSub.remove();
  }, []); // 키보드가 열릴 때 마지막 메시지로 스크롤

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (Constants.statusBarHeight || 0) : 0}
      >
        <View style={styles.container}>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/header.png')}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => {
                if (stompClientRef.current) {
                  stompClientRef.current.deactivate(); // STOMP 연결 종료
                  console.log("🛑 [← 버튼] STOMP 연결 종료");
                }
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: partnerImage }} style={styles.avatar} />
            <Text style={styles.name}>{partnerName}</Text>
            <Text style={styles.name2}> 님과의 대화</Text>
          </View>

          {/* 메시지 영역 */}
          <ScrollView
            ref={scrollRef}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            style={styles.chatContainer}
            contentContainerStyle={{ paddingBottom: 25 }}
          >
            {myName && messages.map((msg, idx) => {
              const isMe = msg.senderEmail?.toLowerCase() === myName?.toLowerCase();
              console.log(`💬 렌더링 메시지[${idx}]:`, msg.message, '| from:', msg.senderEmail, '| isMe:', isMe);

              return (
                <View
                  key={idx}
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  {/*!isMe && <Text style={styles.sender}>{msg.senderEmail}</Text>*/}
                  <Text style={styles.message}>{msg.message}</Text>
                  {/*msg.timestamp && (
                    <Text style={styles.timestamp}>
                      {formatTime(msg.timestamp)} {isMe && (msg.isRead ? '✓✓' : '✓')}
                    </Text>
                  )*/}
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
              <Text style={{ color: 'white', fontFamily: 'Pretendard-Medium', }}>전송</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaViewContext>
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
    height: scaleHeight(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 8,
    zIndex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginLeft: 60,
  },
  name: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'Pretendard-Medium',
  },
  name2: {
    fontSize: 12,
    color: '#9E9E9E',
    fontFamily: 'Pretendard-Medium',
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
    fontFamily: 'Pretendard-Medium',
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
    fontFamily: 'Pretendard-Medium',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#00D282',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
