import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

export default function DiagnosisHistoryScreen() {
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const router = useRouter();

  type DiagnosisHistoryItem = {
    image: string;
    result: string;
    confidence: number;
    createdAt: string;
  };

  const fetchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('diagnosisHistory');
      const data = stored ? JSON.parse(stored) : [];
      setHistory(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error('이력 불러오기 실패:', error);
    }
  };

  const deleteHistoryItem = async (indexToDelete: number) => {
    try {
      const stored = await AsyncStorage.getItem('diagnosisHistory');
      const data = stored ? JSON.parse(stored) : [];

      const original = data.reverse();
      original.splice(indexToDelete, 1); // 해당 인덱스 항목 삭제

      await AsyncStorage.setItem('diagnosisHistory', JSON.stringify(original.reverse()));
      fetchHistory(); // 리스트 다시 로드
    } catch (error) {
      console.error('기록 삭제 실패:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/header.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>진단 기록</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 ? (
            <Text style={styles.emptyText}>진단 이력이 없습니다.</Text>
          ) : (
            history.map((item, index) => (
              <View key={index} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.textBox}>
                  <Text style={styles.resultLabel}>진단 결과</Text>
                  <Text style={styles.resultValue}>{item.result}</Text>
                  <Text style={styles.resultLabel}>정확도</Text>
                  <Text style={styles.resultValue}>
                    {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.resultLabel}>진단 일시</Text>
                  <Text style={styles.resultValue}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : '알 수 없음'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        '진단 기록 삭제',
                        '해당 진단 기록을 삭제하시겠습니까?',
                        [
                          { text: '아니오', style: 'cancel' },
                          { text: '예', onPress: () => deleteHistoryItem(index), style: 'destructive' },
                        ]
                      );
                    }}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>진단기록 삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaViewContext >
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#EEEEEE',
  },
  textBox: {
    padding: 15,
  },
  resultLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 10,
  },
  resultValue: {
    fontSize: 16,
    color: '#363636',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF5757',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});