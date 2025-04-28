import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import axios from 'axios';

const PostQuestionScreen = ({ navigation }) => {
  const [newQuestion, setNewQuestion] = useState('');

  const postQuestion = async () => {
    if (newQuestion.trim() === '') return;
    try {
      await axios.post('http://192.168.1.6:5000/post_question', { text: newQuestion });
      navigation.goBack(); // Go back to the home screen
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TextInput
        style={styles.input}
        placeholder="Ask a question..."
        value={newQuestion}
        onChangeText={setNewQuestion}
        multiline
      />
      <TouchableOpacity style={styles.postButton} onPress={postQuestion}>
        <Text style={styles.postButtonText}>Post Question</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  input: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304FFE',
    marginBottom: 16,
    fontFamily: 'Arial',
  },
  postButton: {
    padding: 16,
    backgroundColor: '#304FFE',
    borderRadius: 20,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostQuestionScreen;