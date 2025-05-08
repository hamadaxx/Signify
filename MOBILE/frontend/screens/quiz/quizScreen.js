import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/fbConfig';
import { useProgress } from '../../contexts/ProgressContext';
import * as Animatable from 'react-native-animatable';

const quizScreen = ({ navigation, route }) => {
  const { unitId, unitTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedAnswerAnimation, setSelectedAnswerAnimation] = useState(new Animated.Value(0)); // Pulse effect animation

  const { completeQuiz, isQuizCompleted, isLessonCompleted } = useProgress();

  // Check if quiz is locked
  useEffect(() => {
    const checkQuizLock = async () => {
      try {
        const videosRef = collection(db, 'units', unitId, 'videos');
        const videosSnapshot = await getDocs(videosRef);
        const totalVideos = videosSnapshot.size;

        const completedVideos = videosSnapshot.docs.filter(doc =>
          isLessonCompleted(doc.id)
        ).length;

        if (completedVideos < totalVideos) {
          Alert.alert(
            'Quiz Locked',
            'Please complete all lessons in this unit before taking the quiz.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Error checking quiz lock:', error);
      }
    };

    checkQuizLock();
  }, [unitId, isLessonCompleted]);

  // Handle answer selection with animation
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));

    // Trigger the pulse animation
    Animated.sequence([
      Animated.timing(selectedAnswerAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(selectedAnswerAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const questionsRef = collection(db, 'units', unitId, 'quiz');
        const snapshot = await getDocs(questionsRef);

        const fetchedQuestions = snapshot.docs.map(doc => {
          const data = doc.data();

          const choices = Array.isArray(data.choices)
            ? data.choices.slice(0, 4) // Take first 4 if array exists
            : ['Hello', 'Goodbye', 'Fine', 'Morning']; // Fallback

          return {
            id: doc.id,
            question: data.question || `Question ${data.questionNumber || doc.id}`,
            choices: choices.map(c => c.toString().trim()), // Ensure string values
            correctAnswer: data.correctAnswer?.toString().trim() || choices[0],
            videoURL: data.videoURL || null,  // This is where we store the video URL for each question
            questionNumber: data.questionNumber || 0
          };
        }).sort((a, b) => a.questionNumber - b.questionNumber);

        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [unitId]);

  // Navigation handlers
  const navigateQuestion = (direction) => {
    const newIndex = direction === 'next'
      ? currentQuestionIndex + 1
      : currentQuestionIndex - 1;

    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
      setSelectedAnswer(selectedAnswers[newIndex] || null);
    }
  };

  const handleSubmit = async () => {
    const correctCount = questions.reduce((count, q, index) => (
      count + (selectedAnswers[index] === q.correctAnswer ? 1 : 0)
    ), 0);

    const score = Math.round((correctCount / questions.length) * 100);

    // Save quiz completion
    await completeQuiz(unitId, score);

    navigation.navigate('quizResults', {
      questions,
      selectedAnswers,
      score,
      unitTitle,
      unitId
    });
  };

  // Render states
  if (loading) return <LoadingView />;
  if (error) return <ErrorView error={error} navigation={navigation} />;
  if (questions.length === 0) return <EmptyView navigation={navigation} />;
  const getYouTubeVideoId = (url) => {
    if (!url) {
      console.error("Error: Video URL is undefined or null");
      return null;
    }

    // Regular expression to extract the YouTube video ID from both full URLs and shortened youtu.be URLs
    const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed))\/|\S+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const match = url.match(regExp);

    if (match && match[1]) {
      return match[1]; // Return the video ID if match found
    } else {
      console.error("Failed to extract YouTube video ID from URL:", url);
      return null; // Return null if no valid video ID was found
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const videoId = currentQuestion.videoURL ? getYouTubeVideoId(currentQuestion.videoURL) : null;

  return (
    <View style={styles.container}>
      <Header unitTitle={unitTitle} navigation={navigation} />
      <ProgressIndicator current={currentQuestionIndex + 1} total={questions.length} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {videoId ? (
          <View style={styles.videoContainer}>
            <Text style={styles.videoLabel}>What is this sign ?</Text>
            <YoutubePlayer
              height={180}
              videoId={videoId}  // Pass the videoId here
              play={false} // Set to `true` if you want the video to play immediately
            />
          </View>
        ) : null}

        <OptionsList
          choices={currentQuestion.choices}
          selectedAnswer={selectedAnswer}
          onSelect={handleAnswerSelect}
          animationValue={selectedAnswerAnimation} // Pass animation value to options
        />
      </ScrollView>

      <NavigationButtons
        isFirst={currentQuestionIndex === 0}
        isLast={isLastQuestion}
        hasSelection={!!selectedAnswer}
        onPrev={() => navigateQuestion('prev')}
        onNext={() => navigateQuestion('next')}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

// Sub-components for better organization
const LoadingView = () => (
  <View style={styles.centeredContainer}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={styles.loadingText}>Loading quiz...</Text>
  </View>
);

const ErrorView = ({ error, navigation }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.buttonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

const EmptyView = ({ navigation }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.emptyText}>No questions available</Text>
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.buttonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

const Header = ({ unitTitle, navigation }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{unitTitle}</Text>
    <View style={{ width: 60 }} />
  </View>
);

const ProgressIndicator = ({ current, total }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressText}>
      Question {current} of {total}
    </Text>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
    </View>
  </View>
);

const OptionsList = ({ choices, selectedAnswer, onSelect, animationValue }) => (
  <View style={styles.optionsContainer}>
    {choices.map((choice, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.option,
          selectedAnswer === choice && styles.selectedOption,
        ]}
        onPress={() => onSelect(choice)}
      >
        <Animated.View
          style={{
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          }}
        >
          <Text style={styles.optionText}>{choice}</Text>
        </Animated.View>
      </TouchableOpacity>
    ))}
  </View>
);

const NavigationButtons = ({
  isFirst,
  isLast,
  hasSelection,
  onPrev,
  onNext,
  onSubmit,
}) => (
  <View style={styles.navigationButtons}>
    {!isFirst && (
      <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={onPrev}>
        <Text style={styles.navButtonText}>Previous</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity
      style={[styles.navButton, styles.nextButton, !hasSelection && styles.disabledButton]}
      onPress={isLast ? onSubmit : onNext}
      disabled={!hasSelection}
    >
      <Text style={styles.navButtonText}>{isLast ? 'Submit Quiz' : 'Next'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  videoLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    padding: 8, // Smaller padding
    marginBottom: 4, // Smaller margin
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#ebf4ff',
  },
  optionText: {
    fontSize: 15, // Slightly smaller font
    color: '#333',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
  navButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default quizScreen;
