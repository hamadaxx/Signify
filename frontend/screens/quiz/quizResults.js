import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const quizResults = ({ route, navigation }) => {
  const { questions, selectedAnswers, score, unitTitle } = route.params;

  const handleReturnToLessons = () => {
    // Navigate back to the "Lessons" screen
    navigation.navigate('Lessons', {
      unitId: route.params.unitId, // unitId passed back
      unitTitle: route.params.unitTitle // unitTitle passed back
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{unitTitle}</Text>
      </View>

      <Text style={styles.rez}>Your Done! You scored : {score}% </Text>
      
      {questions.map((question, index) => {
        const isCorrect = selectedAnswers[index] === question.correctAnswer;
        return (
          <View key={index} style={[styles.questionResult, isCorrect ? styles.correct : styles.incorrect]}>
            <Text style={styles.questionText}>Question {index + 1}:</Text>
            <Text>Your answer: {selectedAnswers[index] || 'Not answered'}</Text>
            {!isCorrect && <Text>Correct answer: {question.correctAnswer}</Text>}
          </View>
        );
      })}

      {/* Return to Lessons Button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={handleReturnToLessons}
      >
        <Text style={styles.returnButtonText}>Return to Lessons</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
// Styles for the Exit button
const styles = StyleSheet.create({
  exitButton: {
    backgroundColor: "#FF6347", // Red color for Exit button
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,},

    rez: { fontSize: 18, fontWeight: 'bold', padding: 10, marginBottom: 10 },
    container: { padding: 20 ,marginBottom:30},
    header: { backgroundColor: '#ADD8E6', fontWeight: 'bold', flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    questionResult: { padding: 15, marginBottom: 10, borderRadius: 5 },
    correct: { backgroundColor: '#e6f7e6' },
    incorrect: { backgroundColor: '#ffebee' },
    questionText: { fontWeight: 'bold', marginBottom: 5 }, returnButton: {
      backgroundColor: '#3B82F6',
      padding: 12,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    returnButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
export default quizResults;
