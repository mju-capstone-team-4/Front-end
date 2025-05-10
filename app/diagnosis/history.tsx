import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진단 이력</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
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
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    backgroundColor: '#00D282',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 15,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    shadowColor: '#363636',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
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
});