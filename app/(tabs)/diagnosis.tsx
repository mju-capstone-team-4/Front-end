import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, 
  TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function DiagnosisScreen() {
  useFocusEffect(
    useCallback(() => {
      setDescription('');
      setImage(null);
    }, [])
  ); // 페이지에 다시 진입할 때 입력 내용 초기화

  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
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

  const handleSubmit = () => {
    if (!image) {
      Alert.alert('이미지를 선택해주세요!');
      return;
    }

    //Alert.alert(image, description); //임시
  
    //console.log('선택된 이미지 URI:', image); //임시(사진URI)
    //console.log('입력된 설명:', description); //임시(부가설명)

    router.push({
      pathname: '/diagnosis/result',
      params: {
        image, //선택된 이미지 URI
        description, //부가설명
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>사진으로 진단</Text>
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>진단하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,  alignItems: 'center', paddingTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  imageBox: {
    width: 180,
    height: 180,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cameraText: { fontSize: 15, color: '#666' },
  image: { width: '100%', height: '100%', borderRadius: 10 },
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
  descriptionText: { color: '#333' },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#33r3',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
