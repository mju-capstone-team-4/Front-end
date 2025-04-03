import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DiagnosisScreen() {
  const router = useRouter();

  const plants = [
    { id: 1, name: '식물A', status: '양호' },
    { id: 2, name: '식물B', status: '주의' },
    { id: 3, name: '식물C', status: '위험' },
    { id: 4, name: '식물D', status: '??' },
  ]; //임시 데이터

  return (
    <View style={styles.container}>
      <Text style={styles.title}>진단이 필요한 식물을 선택해주세요</Text>

      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {plants.length === 0 ? (
          <Text style={styles.emptyMessage}>내 식물이 없습니다.</Text>
        ) : (
          plants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/diagnosis/result',
                  params: {
                    //name: plant.name,
                    //status: plant.status,
                  },
                })
              }
            >
              <View style={styles.imageBox}>
                <Text style={styles.imageText}>사진</Text>
              </View>
              <View>
                <Text>이름 : {plant.name}</Text>
                <Text>상태 : {plant.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => router.push('/diagnosis/select')}>
          <Text style={styles.selectButtonText}>사진으로 진단</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    gap: 16,
  },
  imageBox: {
    width: 60,
    height: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageText: { color: '#666' },
  selectButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});