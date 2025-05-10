import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function DiagnosisScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const router = useRouter();
  const allowedPlants = ['딸기', '토마토', '포도', '호박', '오이', '상추', '고추', '감자', '파프리카']; // 진단 가능 식물 목록 

  type Plant = { // 필요한 식물 정보 타입
    id: number; // 식물 id
    name: string; // 식물 이름
    status: string; // 식물 상태
    image: string; // 식물 이미지 주소
  };

  useEffect(() => {
    fetchMyPlants();
  }, []);

  const fetchMyPlants = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch('http://43.202.4.163:8080/api/disease/predict', { // 백엔드 ip주소
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 
        },
      });

      const data = await response.json();
      setPlants(data); // 사용자의 식물 정보 받아오기

    } catch (error) {
      console.error('식물 정보를 불러오지 못했습니다:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단이 필요한 친구를 선택해주세요</Text>

      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {plants.length === 0 ? (
          <Text style={styles.emptyMessage}>내 식물이 없습니다.</Text>
        ) : (
          plants.map((plant) => {
            const isAllowed = allowedPlants.includes(plant.name);
            return (
              <View key={plant.id} style={styles.card}>
                <View style={styles.imageBox}>
                  {plant.image ? (
                    <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
                  ) : (
                    <Text style={styles.imageText}>사진 없음</Text>
                  )}
                </View>
                <View style={styles.cardTextBox}>
                  <Text style={styles.plantName}>이름: {plant.name}</Text>
                  <Text style={styles.plantStatus}>상태: {plant.status}</Text>
                  <TouchableOpacity
                    style={isAllowed ? styles.myPlantSelectButton : styles.myPlantSelectButton2}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (isAllowed) {
                        router.push({
                          pathname: '/diagnosis/select',
                          params: { name: plant.name },
                        });
                      }
                    }}
                    disabled={!isAllowed}
                  >
                    <Text style={styles.myPlantSelectButtonText}>
                      {isAllowed ? '선택하기' : '진단 불가'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <TouchableOpacity
          style={styles.selectButton}
          activeOpacity={0.85}
          onPress={() => router.push('/diagnosis/select')}>
          <Text style={styles.selectButtonText}>사진으로 진단</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.85}
          onPress={() => router.push('/diagnosis/history')}>
          <Text style={styles.historyButtonText}>진단기록 확인</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    color: '#363636',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginBottom: 8,
  },
  imageBox: {
    width: 180,
    height: 180,
    backgroundColor: '#D4EAE1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    objectFit: 'cover',
  },
  imageText: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  cardTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#363636',
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  plantStatus: {
    fontSize: 10,
    color: '#9E9E9E',
    marginBottom: 30,
    textAlign: "center",
  },
  myPlantSelectButton: {
    backgroundColor: '#00D282',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    textAlign: "center",
  },
  myPlantSelectButton2: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    textAlign: "center",
  },
  myPlantSelectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectButton: {
    marginTop: 10,
    backgroundColor: '#00D282',
    padding: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyButton: {
    marginTop: 5,
    marginBottom: 30,
    backgroundColor: '#FDDB83',
    padding: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#9E9E9E',
  },
});