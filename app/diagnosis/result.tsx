import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiagnosisResultScreen() {
  const {
    image,
    result,
    confidence,
    diseaseInfo,
    watering,
    environment,
    nutrition,
    plantName,
  } = useLocalSearchParams();

  console.log("🌱 선택된 식물 이름 (plantName):", plantName);

  const router = useRouter();

  //const imageUri = Array.isArray(image) ? image[0] : image; // 이미지 
  const predictResult = Array.isArray(result) ? result[0] : result; // 병명   
  const predictConfidence = parseFloat(
    Array.isArray(confidence) ? confidence[0] : confidence
  ); // 정확도 

  const predictedPlant = predictResult?.includes('_') ? predictResult.split('_')[0] : null; // 식물 이름 추출 

  const parsedDiseaseInfo = Array.isArray(diseaseInfo) ? diseaseInfo[0] : diseaseInfo; // 정보
  const parsedWatering = Array.isArray(watering) ? watering[0] : watering; // 수분
  const parsedEnvironment = Array.isArray(environment) ? environment[0] : environment; // 환경 
  const parsedNutrition = Array.isArray(nutrition) ? nutrition[0] : nutrition; // 영양 

  const API_BASE = Constants.expoConfig?.extra?.API_URL;

  const percentage = isNaN(predictConfidence) ? 0 : Math.round(predictConfidence * 100); // 정확도 반올림 

  const formattedResult = predictResult?.includes('_') ? predictResult.split('_')[1] : predictResult;
  const removePlantPrefix = (text: string) => text.replace(/^[^_]+_/, '');
  const cleanedDiseaseInfo = parsedDiseaseInfo ? removePlantPrefix(parsedDiseaseInfo) : '';
  const cleanedWatering = parsedWatering ? removePlantPrefix(parsedWatering) : '';
  const cleanedEnvironment = parsedEnvironment ? removePlantPrefix(parsedEnvironment) : '';
  const cleanedNutrition = parsedNutrition ? removePlantPrefix(parsedNutrition) : '';

  const isMismatch = plantName && predictedPlant && plantName !== predictedPlant; // 식물 이름 체크 
  const headerTitle = isMismatch ? '식물 진단 결과' : plantName ? `${plantName} 진단 결과` : '식물 진단 결과';

  const finalResultText = isMismatch ? '진단 실패' : formattedResult;
  const finalPercentage = isMismatch ? 0 : percentage;

  console.log("🧪 전달된 진단 결과:", formattedResult);
  console.log("📊 정확도:", percentage);
  //console.log("💬 질병 정보:", cleanedDiseaseInfo);
  //console.log("💧 수분 관리:", cleanedWatering);
  //console.log("🌿 환경 관리:", cleanedEnvironment);
  //console.log("🍽️ 영양 관리:", cleanedNutrition);


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

      console.log("🗂️ 진단 히스토리:", latest);
    };
    loadLatestDiagnosis();
  }, []); // 임시 이미지 출력

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/diagnosis')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
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
              fill={finalPercentage}
              tintColor="#00D282"
              backgroundColor="#EEEEEE"
              rotation={-90} // 90도 회전
              arcSweepAngle={180}
              lineCap="round"
            >
              {() => (
                <View style={styles.labelContainer}>
                  <Text style={styles.statusText}>정확도</Text>
                  <Text style={styles.percentText}>{finalPercentage}%</Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.labelText}>진단명</Text>
            <Text style={styles.diagnosisText}>{finalResultText}</Text>
          </View>

          <View style={styles.imageBox}>
            {diagnosis?.image ? ( // {imageUri? (
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

        {!isMismatch && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Image source={require('../../assets/images/plant_icon.png')} style={styles.icon} />
              <Text style={styles.sectionTitle}>진단과 관련된 치료방법</Text>
            </View>

            {cleanedDiseaseInfo && (
              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <Image source={require('../../assets/images/plant_icon.png')} style={styles.detailIcon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>질병 정보</Text>
                  <Text style={styles.detailText}>{cleanedDiseaseInfo}</Text>
                </View>
              </View>
            )}
            {cleanedWatering && (
              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <Image source={require('../../assets/images/plant_icon.png')} style={styles.detailIcon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>수분 관리</Text>
                  <Text style={styles.detailText}>{cleanedWatering}</Text>
                </View>
              </View>
            )}
            {cleanedEnvironment && (
              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <Image source={require('../../assets/images/plant_icon.png')} style={styles.detailIcon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>환경 관리</Text>
                  <Text style={styles.detailText}>{cleanedEnvironment}</Text>
                </View>
              </View>
            )}
            {cleanedNutrition && (
              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <Image source={require('../../assets/images/plant_icon.png')} style={styles.detailIcon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>영양 관리</Text>
                  <Text style={styles.detailText}>{cleanedNutrition}</Text>
                </View>
              </View>
            )}
          </View>
        )}
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
    marginTop: 3,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#363636',
    marginBottom: 4,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
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
