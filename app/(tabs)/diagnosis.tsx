import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function DiagnosisScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const router = useRouter();
  
  type Plant = { // 필요한 식물 정보 타입
    id: number; // 유저 id
    name: string; // 식물 이름
    status: string; // 식물 상태
    image: string; // 식물 이미지 주소
  };

  useEffect(() => {
    fetchMyPlants();
  }, []);

  const fetchMyPlants = async () => {
    try {
      const response = await fetch('http://192.168.0.X:8080'); // 백엔드 ip주소
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('식물 정보를 불러오지 못했습니다:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단이 필요한 식물을 선택해주세요</Text>

      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {plants.length === 0 ? (
          <Text style={styles.emptyMessage}>내 식물이 없습니다.</Text>
        ) : (
          plants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/diagnosis/select',
                  params: { name: plant.name },
                })
              }
            >
              <View style={styles.imageBox}>
                {plant.image ? (
                  <Image source={{ uri: plant.image }} style={styles.image} />
                ) : (
                  <Text style={styles.imageText}>사진</Text>
                )}
              </View>
              <View>
                <Text>이름 : {plant.name}</Text>
                <Text>상태 : {plant.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => router.push('/diagnosis/select')}>
          <Text style={styles.selectButtonText}>사진으로 진단</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    gap: 16,
  },
  imageBox: {
    width: 60,
    height: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imageText: { 
    color: '#666' 
  },
  selectButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});