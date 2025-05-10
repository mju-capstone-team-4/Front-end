import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert,
  TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import LoadingSplash from './LoadingSplash';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function DiagnosisSelectScreen() {
  useFocusEffect(
    useCallback(() => {
      setDescription('');
      setImage(null);
    }, [])
  ); // 페이지에 다시 진입할 때 입력 내용 초기화

  const router = useRouter();
  const { name } = useLocalSearchParams(); //dianosis.tsx에서 식물 이름 name 받기
  const selectedPlantName = Array.isArray(name) ? name[0] : name;
  const API_BASE = Constants.expoConfig?.extra?.API_URL;
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const allowedPlants = ['딸기', '토마토', '포도', '호박', '오이', '상추', '고추', '감자', '파프리카']; // 진단 가능 식물 목록 
  const isFromMyPlant = !!selectedPlantName;
  const [plantName, setPlantName] = useState<string | null>(isFromMyPlant ? selectedPlantName : null);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    // 이미지 권한 확인  
    if (!permission.granted) {
      Alert.alert('카메라 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleImageSelect = () => {
    Alert.alert('사진 선택', '촬영 또는 갤러리에서 선택하세요', [
      { text: '카메라 촬영', onPress: takePhoto },
      { text: '갤러리에서 선택', onPress: pickImage },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const saveToHistory = async (item: { image: string, result: string, confidence: number }) => {
    try {
      const existing = await AsyncStorage.getItem('diagnosisHistory');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [
        ...parsed,
        {
          ...item,
          createdAt: new Date().toISOString(), // 진단 시각 추가
        },
      ];
      await AsyncStorage.setItem('diagnosisHistory', JSON.stringify(updated));
    } catch (e) {
      console.error('로컬 저장 실패:', e);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('이미지를 선택해주세요!');
      return;
    }
    if (!plantName || !allowedPlants.includes(plantName)) {
      Alert.alert('식물을 선택해주세요!');
      return;
    }

    setIsLoading(true); // 로딩 시작

    // 최소 로딩 시간을 위한 시작 시간 기록
    const startTime = Date.now();

    const fileName = image.split('/').pop(); // 이미지 이름 추출
    const fileType = fileName?.split('.').pop() || 'jpg'; // 이미지 타입 추출

    const formData = new FormData();
    formData.append('file', {
      uri: image, // 이미지 파일 경로 
      name: fileName, // 업로드될 파일의 이름
      type: `image/${fileType}`,
    } as any);

    formData.append('description', description);
    formData.append('plant', selectedPlantName);

    try {
      const response = await fetch(`${API_BASE}/disease/predict`, { //백엔드 ip
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // 최소 로딩 시간 계산
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 최소 2초

      // 최소 로딩 시간보다 적게 걸렸다면 남은 시간만큼 대기
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      await saveToHistory({
        image,
        result: result.result,
        confidence: result.confidence,
      });

      router.push({
        pathname: '/diagnosis/result',
        params: {
          image: image, // 식물 이미지 
          result: result.result, // 식물의 진단명 
          confidence: result.confidence, // 병명 정확도
          //image: result.image_url // 이미지 url
        },
      });

    } catch (error) {
      console.error('진단 요청 실패:', error);
      Alert.alert('진단 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <>
      {isLoading && <LoadingSplash />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isFromMyPlant && plantName ? `${plantName} 진단` : '식물 진단'}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.mainText}>사진으로 식물의{'\n'}상태를 진단해보세요</Text>

          <TouchableOpacity style={styles.imageBox} onPress={handleImageSelect}>
            <Image
              source={
                image
                  ? { uri: image }
                  : require('../../assets/images/picture.png') // 사진 아이콘
              }
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {!isFromMyPlant && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>식물 선택</Text>
              <RNPickerSelect
                onValueChange={(value) => setPlantName(value)}
                placeholder={{ label: '식물을 선택하세요', value: null }}
                value={plantName}
                items={allowedPlants.map((name) => ({ label: name, value: name }))}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Ionicons name="chevron-down" size={20} color="#555" />}
              />
            </View>
          )}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Image source={require('../../assets/images/plant_icon.png')} style={styles.icon} />
              <Text style={styles.sectionTitle}>부가설명</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="작성 시 진단 정확도가 올라갑니다"
              placeholderTextColor="#9E9E9E"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>진단하기</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },
  imageBox: {
    width: 250,
    height: 250,
    borderRadius: 90,
    backgroundColor: '#D4EAE1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#363636',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#00D282',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#363636',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownItemSelected: {
    backgroundColor: '#00D282',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#363636',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#363636',
    backgroundColor: '#fff',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#363636',
    backgroundColor: '#fff',
    paddingRight: 30,
  },
  iconContainer: {
    top: 15,
    right: 10,
  },
};