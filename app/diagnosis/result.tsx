import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ResultScreen() {
  const { image, description } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단 결과</Text>

      {image && (<Image source={{ uri: image as string }} style={styles.image} />)}
      <Text style={styles.label}>설명:</Text>
      <Text>{description}</Text> {/* 임시 */}
      <Text style={styles.label}>이미지 URI:</Text>
      <Text>{image}</Text> {/* 임시 */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
    label: { fontWeight: 'bold', marginTop: 10 },
    text: { fontSize: 16, marginTop: 5 },
});