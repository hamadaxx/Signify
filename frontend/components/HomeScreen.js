import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const HomeScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState({}); // Stores reply text for each question
  const [expandedQuestionId, setExpandedQuestionId] = useState(null); // Tracks which question is expanded

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:5000/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const postQuestion = async () => {
    if (newQuestion.trim() === '') return;
    try {
      await axios.post('http://192.168.1.6:5000/post_question', { text: newQuestion });
      setNewQuestion('');
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  const postReply = async (questionId) => {
    if (!newReply[questionId]?.trim()) return;
    try {
      await axios.post(`http://192.168.1.6:5000/reply/${questionId}`, { reply: newReply[questionId] });
      setNewReply({ ...newReply, [questionId]: '' }); // Clear the reply input
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const likeQuestion = async (questionId) => {
    try {
      await axios.post(`http://192.168.1.6:5000/like/${questionId}`);
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  const toggleExpandQuestion = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Forum</Text>
      </View>

      {/* Post Question Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          value={newQuestion}
          onChangeText={setNewQuestion}
        />
        <TouchableOpacity style={styles.postButton} onPress={postQuestion}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.questionItem}>
            {/* Question Text */}
            <Text style={styles.questionText}>{item.text}</Text>

            {/* Like and Show Replies Buttons */}
            <View style={styles.actionsContainer}>
              {/* Like Button */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => likeQuestion(item._id)}
              >
                <Text style={styles.likeButtonText}>👍 {item.likes}</Text>
              </TouchableOpacity>

              {/* Show Replies Button */}
              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => toggleExpandQuestion(item._id)}
              >
                <Text style={styles.replyButtonText}>
                  {expandedQuestionId === item._id ? 'Hide Replies' : 'Show Replies'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Replies Section (Conditional Rendering) */}
            {expandedQuestionId === item._id && (
              <View style={styles.repliesContainer}>
                {/* Replies List */}
                <FlatList
                  data={item.replies}
                  keyExtractor={(reply, index) => index.toString()}
                  renderItem={({ item: reply }) => (
                    <View style={styles.replyItem}>
                      <Text style={styles.replyText}>{reply}</Text>
                    </View>
                  )}
                />

                {/* Reply Input */}
                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply..."
                    value={newReply[item._id] || ''}
                    onChangeText={(text) =>
                      setNewReply({ ...newReply, [item._id]: text })
                    }
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.postReplyButton}
                    onPress={() => postReply(item._id)}
                  >
                    <Text style={styles.postReplyButtonText}>Post Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee', // Black text color
  },
  inputContainer: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    marginRight: 8,
  },
  postButton: {
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  questionItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  replyButton: {
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyItem: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: '#333333',
  },
  replyInputContainer: {
    marginTop: 8,
  },
  replyInput: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    marginBottom: 8,
  },
  postReplyButton: {
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  postReplyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;