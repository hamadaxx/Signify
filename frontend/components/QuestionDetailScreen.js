import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const QuestionDetailScreen = ({ route }) => {
  const { questionId } = route.params;
  const [question, setQuestion] = useState(null);
  const [newReply, setNewReply] = useState('');

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://192.168.1.6:5000/questions/${questionId}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const postReply = async () => {
    if (newReply.trim() === '') return;
    try {
      await axios.post(`http://192.168.1.6:5000/reply/${questionId}`, { reply: newReply });
      setNewReply('');
      fetchQuestion(); 
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const likeQuestion = async () => {
    try {
      await axios.post(`http://192.168.1.6:5000/like/${questionId}`);
      fetchQuestion(); // Refresh the question
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  if (!question) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
        <TouchableOpacity style={styles.likeButton} onPress={likeQuestion}>
          <Text style={styles.likeButtonText}>👍 {question.likes}</Text>
        </TouchableOpacity>
      </View>

      {/* Reply Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a reply..."
          value={newReply}
          onChangeText={setNewReply}
          multiline
        />
        <TouchableOpacity style={styles.postButton} onPress={postReply}>
          <Text style={styles.postButtonText}>Post Reply</Text>
        </TouchableOpacity>
      </View>

      {/* Replies List */}
      <FlatList
        data={question.replies}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.replyItem}>
            <Text>{item}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  questionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  likeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    marginBottom: 8,
  },
  postButton: {
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  replyItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default QuestionDetailScreen;