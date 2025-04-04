import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DiagnosisResultScreen() {
  const { image, description, result, confidence, image2 } = useLocalSearchParams();
  const imageUri = Array.isArray(image) ? image[0] : image;
  const descText = Array.isArray(description) ? description[0] : description;
  const predictResult = Array.isArray(result) ? result[0] : result;
  const predictConfidence = Array.isArray(confidence) ? confidence[0] : confidence;

  const imageUri2 = Array.isArray(image2) ? image2[0] : image2; //임시 사진

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단 결과</Text>

      {imageUri2 ? (
        <Image
          source={{ uri: imageUri2 }}
          style={styles.image}
          resizeMode="cover"
        //onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent.error)}
        />
      ) : (
        <Text>이미지가 없습니다.</Text>
      )}

      <View style={styles.detail}>
        <Text style={styles.resultLabel}>예측된 질병</Text>
        <Text style={styles.resultValue}>{predictResult || '없음'}</Text>

        <Text style={styles.resultLabel}>정확도</Text>
        <Text style={styles.resultValue}>{predictConfidence ? `${predictConfidence}%` : 'N/A'}</Text>

        <Text style={styles.resultLabel}>부가 설명</Text>
        <Text style={styles.resultText}>{descText || '입력한 설명이 없습니다.'}</Text>
        
        <Text style={styles.resultLabel}>이미지 URI:{/* 임시 */}</Text>
        <Text>{imageUri}</Text>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  detail: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 12,
  },
  resultValue: {
    fontSize: 18,
    color: '#222',
    marginTop: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
});