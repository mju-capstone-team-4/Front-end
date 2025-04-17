import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert,
  TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

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
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('이미지를 선택해주세요!');
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

    /*
    FormData {
      "file": (이미지 파일),
      "description": "부가 설명"
      "plant": "식물의 이름"
    }
    */ // FormData 구조 예시

    try {
      const response = await fetch('http://43.202.4.163:8080/api/disease/predict', { //백엔드 ip
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      // 최소 로딩 시간 계산
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 1000; // 최소 1초
      
      // 최소 로딩 시간보다 적게 걸렸다면 남은 시간만큼 대기
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>
            {selectedPlantName ? `${selectedPlantName} 진단하기` : '사진으로 진단'}
          </Text>
          <Text style={styles.subtitle}>사진으로 식물 상태를 진단해드려요</Text>

          <TouchableOpacity style={styles.imageBox} onPress={handleImageSelect}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.cameraText}>사진을 업로드 해주세요</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.descriptionTitle}>부가설명</Text>
          <View style={styles.descriptionBox}>
            <TextInput
              style={styles.input}
              placeholder="작성 시 진단 정확도가 올라갑니다."
              placeholderTextColor="#999"
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
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>진단하기</Text>
            )}
          </TouchableOpacity>
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>진단 중입니다...</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingTop: 50 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 20 
  },
  imageBox: {
    width: 180,
    height: 180,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cameraText: { 
    fontSize: 15, 
    color: '#666' 
  },
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 10 
  },
  descriptionBox: {
    backgroundColor: '#ddd',
    marginTop: 30,
    padding: 0,
    width: '90%',
    borderRadius: 10,
    overflow: 'visible'
  },
  input: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    color: '#333',
  },
  descriptionTitle: {
    marginTop: 40,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  descriptionText: { 
    color: '#333' 
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
