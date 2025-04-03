import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  price?: string;
  onPress: () => void;
};

const QuestionBox = ({ title, price, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{title}</Text>
        {price && <Text style={styles.priceText}>💰 {price}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  questionBox: {
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 14,
    marginTop: 8,
    color: "#333",
  },
});

export default QuestionBox;