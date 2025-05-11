import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiagnosisResultScreen() {
  const { image, result, confidence } = useLocalSearchParams();
  const router = useRouter();

  const imageUri = Array.isArray(image) ? image[0] : image; // 이미지 
  const predictResult = Array.isArray(result) ? result[0] : result; // 병명 
  const predictConfidence = parseFloat(
    Array.isArray(confidence) ? confidence[0] : confidence
  ); // 정확도 
  const API_BASE = Constants.expoConfig?.extra?.API_URL;

  const percentage = isNaN(predictConfidence) ? 0 : Math.round(predictConfidence * 100);

  /*const [treatments, setTreatments] = useState([]); // 치료 방법

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch(`${API_BASE}/disease/treatment?name=${predictResult}`);
        const data = await response.json();
        setTreatments(data);
      } catch (error) {
        console.error('치료 방법 불러오기 실패:', error);
        setTreatments([]);
      }
    };

    if (predictResult) {
      fetchTreatments();
    }
  }, [predictResult]); */

  const [diagnosis, setDiagnosis] = useState<{
    image: string;
    result: string;
    confidence: number;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    const loadLatestDiagnosis = async () => {
      const stored = await AsyncStorage.getItem('diagnosisHistory');
      const data = stored ? JSON.parse(stored) : [];
      const latest = data[data.length - 1];
      setDiagnosis(latest);
    };
    loadLatestDiagnosis();
  }, []); // 임시 이미지 출력

  const dummytreatments = [
    {
      id: '1',
      icon: require('../../assets/images/book_icon.png'),
      title: '수분 공급',
      description: '매일 아침, 물을 주세요.',
    },
    {
      id: '2',
      icon: require('../../assets/images/book_icon.png'),
      title: '자외선 조절',
      description: '매일 오후 2시에 그늘에 놓으세요.',
    },
    {
      id: '3',
      icon: require('../../assets/images/book_icon.png'),
      title: '비료 공급',
      description: '2주에 한 번 비료를 주세요.',
    },
  ]; // 더미 데이터

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/diagnosis')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식물 진단 결과</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../../assets/images/plant_icon.png')} style={styles.icon} />
            <Text style={styles.sectionTitle}>진단 결과</Text>
          </View>

          <View style={styles.gaugeContainer}>
            <AnimatedCircularProgress // 반달 게이지
              size={180}
              width={15}
              fill={percentage}
              tintColor="#00D282"
              backgroundColor="#EEEEEE"
              rotation={-90} // 90도 회전
              arcSweepAngle={180}
              lineCap="round"
            >
              {() => (
                <View style={styles.labelContainer}>
                  <Text style={styles.statusText}>정확도</Text>
                  <Text style={styles.percentText}>{percentage}%</Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.labelText}>진단명</Text>
            <Text style={styles.diagnosisText}>{predictResult || '진단명 없음'}</Text>
          </View>

          <View style={styles.imageBox}>
            {diagnosis?.image? ( // {imageUri? (
              <Image
                //source={{ uri: imageUri }}
                source={{ uri: diagnosis.image }}
                style={styles.image}
                resizeMode="cover"
                onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent.error)} // 이미지 출력 확인
              />
            ) : (
              <Text>이미지가 없습니다.</Text>
            )}
          </View>
        </View>

        {/* 치료 방법 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../../assets/images/plant_icon.png')} style={styles.icon} />
            <Text style={styles.sectionTitle}>진단과 관련된 치료방법</Text>
          </View>
          {dummytreatments.map((item) => (
            <View key={item.id} style={styles.treatmentItem}>
              <Image source={item.icon} style={styles.treatmentIcon} />
              <View style={styles.treatmentText}>
                <Text style={styles.treatmentTitle}>{item.title}</Text>
                <Text style={styles.treatmentDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#00D282',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363636',
  },
  sectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginBottom: 8,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  labelContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
    width: 100,
  },
  statusText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  percentText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D282',
  },
  labelText: {
    fontSize: 14,
    marginTop: -70,
    color: '#363636',
    fontWeight: 'bold',
  },
  diagnosisText: {
    fontSize: 16,
    color: '#363636',
    marginTop: 10,
  },
  imageBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  treatmentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    resizeMode: 'contain',
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  treatmentText: {
    flex: 1,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#363636',
  },
  treatmentDesc: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 15,
    padding: 8,
  },
  diseaseButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
