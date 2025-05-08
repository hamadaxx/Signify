import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, query, orderBy, serverTimestamp, increment, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/fbConfig';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState({});
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Get user's display name
  const getUserDisplayName = () => {
    // First try to get the full name from userProfile
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    // Then try displayName from userProfile
    if (userProfile?.displayName) {
      return userProfile.displayName;
    }
    // Then try displayName from user object
    if (user?.displayName) {
      return user.displayName;
    }
    // If no name is found, return the email username
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Anonymous';
  };

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Create notification
  const createNotification = async (userId, type, questionId, questionText) => {
    if (!userId || !type || !questionId || !questionText) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        type,
        questionId,
        questionText,
        actorId: user.uid,
        actorName: getUserDisplayName(),
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Post new question
  const postQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    
    try {
      const questionsRef = collection(db, 'questions');
      const userName = getUserDisplayName();
      console.log('Posting question with user name:', userName); // Debug log
      
      await addDoc(questionsRef, {
        text: newQuestion,
        likes: 0,
        replies: [],
        timestamp: serverTimestamp(),
        userId: user.uid,
        userName: userName,
        userEmail: user.email // Store email as backup
      });
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  // Post reply
  const postReply = async (questionId, questionUserId, questionText) => {
    if (!newReply[questionId]?.trim() || !user) return;

    try {
      const questionRef = doc(db, 'questions', questionId);
      const userName = getUserDisplayName();
      console.log('Posting reply with user name:', userName); // Debug log
      
      const replyData = {
        text: newReply[questionId],
        userId: user.uid,
        userName: userName,
        userEmail: user.email, // Store email as backup
        timestamp: new Date().toISOString()
      };
      
      const questionDoc = await getDoc(questionRef);
      const currentReplies = questionDoc.data()?.replies || [];
      await updateDoc(questionRef, {
        replies: [...currentReplies, replyData]
      });

      // Create notification for question owner
      if (questionUserId && questionUserId !== user.uid) {
        await createNotification(questionUserId, 'reply', questionId, questionText);
      }

      setNewReply({ ...newReply, [questionId]: '' });
      fetchQuestions();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  // Like question
  const likeQuestion = async (questionId, questionUserId, questionText) => {
    if (!user) return;
    
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid)
      });

      // Create notification for question owner
      if (questionUserId && questionUserId !== user.uid) {
        await createNotification(questionUserId, 'like', questionId, questionText);
      }

      fetchQuestions();
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  const clearAllQuestions = async () => {
    Alert.alert(
      'Clear All Questions',
      'Are you sure you want to delete all questions? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const questionsRef = collection(db, 'questions');
              const querySnapshot = await getDocs(questionsRef);
              
              // Delete each question
              const deletePromises = querySnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
              );
              
              await Promise.all(deletePromises);
              
              // Clear notifications as well
              const notificationsRef = collection(db, 'notifications');
              const notificationsSnapshot = await getDocs(notificationsRef);
              
              const deleteNotificationPromises = notificationsSnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
              );
              
              await Promise.all(deleteNotificationPromises);
              
              Alert.alert('Success', 'All questions and notifications have been cleared');
              fetchQuestions(); // Refresh the list
            } catch (error) {
              console.error('Error clearing questions:', error);
              Alert.alert('Error', 'Failed to clear questions: ' + error.message);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Forum</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#6200ee" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllQuestions}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

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

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.questionItem}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionText}>{item.text}</Text>
              <View style={styles.authorContainer}>
                <Ionicons name="person-circle-outline" size={16} color="#666" />
                <Text style={styles.authorText}>Posted by: {item.userName}</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => likeQuestion(item._id, item.userId, item.text)}
              >
                <Text style={styles.likeButtonText}>👍 {item.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => setExpandedQuestionId(expandedQuestionId === item._id ? null : item._id)}
              >
                <Text style={styles.replyButtonText}>
                  {expandedQuestionId === item._id ? 'Hide Replies' : 'Show Replies'}
                </Text>
              </TouchableOpacity>
            </View>

            {expandedQuestionId === item._id && (
              <View style={styles.repliesContainer}>
                <FlatList
                  data={item.replies}
                  keyExtractor={(reply, index) => index.toString()}
                  renderItem={({ item: reply }) => (
                    <View style={styles.replyItem}>
                      <Text style={styles.replyText}>{reply.text}</Text>
                      <View style={styles.replyAuthorContainer}>
                        <Ionicons name="person-circle-outline" size={14} color="#666" />
                        <Text style={styles.replyAuthor}>By: {reply.userName}</Text>
                      </View>
                    </View>
                  )}
                />

                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply..."
                    value={newReply[item._id] || ''}
                    onChangeText={(text) => setNewReply({ ...newReply, [item._id]: text })}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.postReplyButton}
                    onPress={() => postReply(item._id, item.userId, item.text)}
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
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
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
  questionHeader: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 4,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
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
  replyAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  replyAuthor: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
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
  headerActions: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 8,
  },
});

export default HomeScreen;