import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default function ChatbotScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const API_BASE = Constants.expoConfig?.extra?.API_URL;

  const getToken = async () => {
    return await SecureStore.getItemAsync('accessToken');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API_BASE}/mypage/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.content);

      } catch (err: any) {
        console.error('사용자 목록 불러오기 실패:', err);
        /*
        if (err.response) {
          console.error('서버 응답 코드:', err.response.status);
          console.error('서버 응답 데이터:', err.response.data);
        } else {
          console.error('네트워크 에러 또는 서버 미응답');
        }*/
        setUsers([
          {
            id: 1,
            username: 'test user1',
            profileUrl: 'https://cdn.m-i.kr/news/photo/202205/921704_686770_251.jpg',
          },
          {
            id: 2,
            username: 'test user2',
            profileUrl: 'https://cdn.m-i.kr/news/photo/202205/921704_686770_251.jpg',
          },
          {
            id: 3,
            username: 'test user3',
            profileUrl: 'https://cdn.m-i.kr/news/photo/202205/921704_686770_251.jpg',
          },
        ]); // 임시 데이터
      }
    };

    fetchUsers();
  }, []);

  const handleUserPress = async (otherMemberId: number, name: string, image: string) => {
    try {
      const token = getToken;

      const res = await axios.post(
        `${API_BASE}/chat/room/private/create?otherMemberId=${otherMemberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const roomId = res.data;

      router.push({
        pathname: '/chat/[roomId]',
        params: {
          roomId: roomId.toString(),
          partnerName: name,
          partnerImage: image,
        },
      });
    } catch (err) {
      console.error('채팅방 생성 실패:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabActive}
            onPress={() => { }} // 현재 화면
          >
            <Text style={styles.tabTextActive}>거래 채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabInactive}
            onPress={() => router.push('/chat/aiChat')} // AI 채팅 클릭 시 이동
          >
            <Text style={styles.tabTextInactive}>AI 채팅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="사용자를 검색하세요"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView contentContainerStyle={styles.userList}>
        {users
          .filter(u => u.username && u.username.includes(search))
          .map((user, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleUserPress(user.id, user.username, user.profileUrl)}
              style={styles.userCard}
            >
              <Image source={{ uri: user.profileUrl }} style={styles.avatar} />
              <Text style={styles.userName}>{user.username}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginRight: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    backgroundColor: '#00D282',
    paddingVertical: 10,
    borderRadius: 20,
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
  searchBar: {
    borderWidth: 1,
    borderColor: '#00D282',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userCard: {
    width: '47%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 999,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#333',
  },
});