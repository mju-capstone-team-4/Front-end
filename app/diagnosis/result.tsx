import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DiagnosisResultScreen() {
  const { image, description } = useLocalSearchParams();
  const imageUri = Array.isArray(image) ? image[0] : image;
  const descText = Array.isArray(description) ? description[0] : description;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>진단 결과</Text>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          //onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent.error)}
        />
      ) : (
        <Text>이미지가 없습니다.</Text>
        //http이미지 출력은 가능
      )} 

      <Text style={styles.label}>설명:</Text>
      <Text>{descText}</Text>
      <Text style={styles.label}>이미지 URI:</Text>
      <Text>{imageUri}</Text>

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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10
  },
  text: {
    fontSize: 16,
    marginTop: 5
  },
});