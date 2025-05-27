import { ScrollView, View, Text, StyleSheet, Image, BackHandler, Dimensions, } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 기준 사이즈
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// 스케일 함수 -> 추후 반응형으로 변경
const scaleWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

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

  const isMismatch = plantName && predictedPlant && plantName !== predictedPlant; // 식물 이름 체크  // 진단 실패 주석처리(isMismatch)
  //const headerTitle = isMismatch ? '식물 진단 결과' : plantName ? `${plantName} 진단 결과` : '식물 진단 결과'; // 진단 실패 주석처리(isMismatch)
  const headerTitle = plantName ? `${predictedPlant} 진단 결과` : '식물 진단 결과';

  //const finalResultText = isMismatch ? '진단 실패' : formattedResult; // 진단 실패 주석처리(isMismatch)
  //const finalPercentage = isMismatch ? 0 : percentage; // 진단 실패 주석처리(isMismatch)
  const finalResultText = formattedResult;
  const finalPercentage = percentage;

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

    const backAction = () => {
      router.replace('/diagnosis');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove(); // 언마운트 시 정리
  }, []); // 임시 이미지 출력

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/header.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={() => router.replace('/diagnosis')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>
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
                    {isMismatch ? (
                      <Text style={styles.discrepancyText}>사진과 식물명이 일치하지 않습니다</Text>
                    ) : (
                      <Text></Text>
                    )}
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

          {/* {!isMismatch && formattedResult !== "정상" && ( */}{/*진단 실패 주석처리(isMismatch) */}
          {formattedResult !== "정상" && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Image source={require('../../assets/images/plant_icon.png')} style={styles.icon} />
                <Text style={styles.sectionTitle}>진단과 관련된 치료방법</Text>
              </View>

              {cleanedDiseaseInfo && (
                <View style={styles.detailItem}>
                  <View style={styles.detailHeader}>
                    <Image source={require('../../assets/images/information.png')} style={styles.detailIcon} />
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
                    <Image source={require('../../assets/images/water.png')} style={styles.detailIcon} />
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
                    <Image source={require('../../assets/images/environment.png')} style={styles.detailIcon} />
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
                    <Image source={require('../../assets/images/nutrient.png')} style={styles.detailIcon} />
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
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    height: scaleHeight(90),
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
  titleContainer: {
    paddingVertical: 10,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    zIndex: 1,
    fontFamily: 'Pretendard-ExtraBold',
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
    color: '#363636',
    fontFamily: 'Pretendard-ExtraBold',
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
    fontFamily: 'Pretendard-Medium',
  },
  discrepancyText: {
    fontSize: 12,
    color: '#ff0000',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },
  percentText: {
    fontSize: 24,
    color: '#00D282',
    fontFamily: 'Pretendard-SemiBold',

  },
  labelText: {
    fontSize: 14,
    marginTop: -50,
    color: '#363636',
    fontFamily: 'Pretendard-SemiBold',
  },
  diagnosisText: {
    fontSize: 16,
    color: '#363636',
    marginTop: 10,
    fontFamily: 'Pretendard-Medium',
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
    color: '#363636',
    marginBottom: 4,
    fontFamily: 'Pretendard-SemiBold',
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    fontFamily: 'Pretendard-Medium',
  },
});
