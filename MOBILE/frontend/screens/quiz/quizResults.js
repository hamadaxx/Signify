import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../../contexts/ProgressContext';
import YoutubePlayer from 'react-native-youtube-iframe';


const quizResults = ({ route, navigation }) => {
  const { questions, selectedAnswers, score, unitTitle, unitId } = route.params;
  const { getQuizScore } = useProgress();
  const previousScore = getQuizScore(unitId);

  const handleReturnToLessons = () => {
    navigation.navigate('Lessons', {
      unitId,
      unitTitle
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{unitTitle}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Quiz Complete!</Text>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
            {score}%
          </Text>
        </View>
        {previousScore !== null && (
          <Text style={styles.previousScore}>
            Previous Score: {previousScore}%
          </Text>
        )}
      </View>
      
      <View style={styles.resultsContainer}>
        {questions.map((question, index) => {
          const isCorrect = selectedAnswers[index] === question.correctAnswer;
          return (
            <View 
              key={index} 
              style={[
                styles.questionResult, 
                isCorrect ? styles.correct : styles.incorrect
              ]}
            >
              <Text style={styles.questionNumber}>Question {index + 1}</Text>
              <Text style={styles.questionText}>{question.question}</Text>
              
              {question.videoURL && (
                <View style={styles.videoContainer}>
                  <Text style={styles.videoLabel}>Video Reference:</Text>
                  <YoutubePlayer
                    height={180}
                    videoId={getYouTubeVideoId(question.videoURL)}
                    play={false}
                  />
                </View>
              )}
              
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>Your Answer:</Text>
                <Text style={[
                  styles.answerText,
                  isCorrect ? styles.correctText : styles.incorrectText
                ]}>
                  {selectedAnswers[index] || 'Not answered'}
                </Text>
              </View>
              
              {!isCorrect && (
                <View style={styles.correctAnswerContainer}>
                  <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
                  <Text style={styles.correctAnswerText}>
                    {question.correctAnswer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.returnButton}
        onPress={handleReturnToLessons}
      >
        <Text style={styles.returnButtonText}>Return to Lessons</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed))\/|\S+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    backgroundColor: '#ADD8E6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  previousScore: {
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  questionResult: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  correct: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    backgroundColor:  '#B3FFB3',
    
  },
  incorrect: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
    backgroundColor:  '#FFB3B3',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  videoContainer: {
    marginVertical: 10,
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  answerContainer: {
    marginTop: 10,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 16,
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  correctAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  returnButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default quizResults;