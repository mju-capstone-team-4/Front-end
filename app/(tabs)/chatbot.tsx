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
        const headers = token ? { Authorization: `Bearer ${token}` } : {}; // 임시 

        const res = await axios.get(`${API_BASE}/mypage/members`, {
          headers, // 테스트 계정 접속용
          /*headers: {
            Authorization: `Bearer ${token}`,
          }, */
        });
        setUsers(res.data.content);

      } catch (err: any) {
        console.error('사용자 목록 불러오기 실패:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleUserPress = async (otherMemberId: number, name: string, image: string) => {
    try {
      const token = await getToken();

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

      <View style={styles.searchWrapper}>
        <Image
          source={require('../../assets/images/search_button.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="사용자를 검색하세요"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9E9E9E"
        />
      </View>

      <ScrollView contentContainerStyle={styles.userList}>
        {users
          .filter(u => u.username && u.username.includes(search))
          .map((user, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleUserPress(user.id, user.username, user.profileUrl)}
              style={styles.userCard}
            >
              <Image
                source={
                  user.profileUrl
                    ? { uri: user.profileUrl }
                    : require('../../assets/images/plant_icon.png')
                }
                style={styles.avatar}
              />              
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D282',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginLeft: -5,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#393939',
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userCard: {
    width: '46%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#393939',
  },
});