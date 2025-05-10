import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ChatbotScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const getToken = async () => {
    return await SecureStore.getItemAsync('accessToken');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken;
        const res = await axios.get('http://43.202.4.163:8080/api/mypage/members', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('사용자 목록 불러오기 실패:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleUserPress = async (otherMemberId: number, name: string, image: string) => {
    try {
      const token = getToken;

      const res = await axios.post(
        `http://43.202.4.163:8080/api/chat/room/private/create?otherMemberId=${otherMemberId}`,
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
          .filter(u => u.name.includes(search))
          .map((user, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleUserPress(user.id, user.name, user.image)}
              style={styles.userCard}
            >
              <Image source={{ uri: user.image }} style={styles.avatar} />
              <Text style={styles.userName}>{user.name}</Text>
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