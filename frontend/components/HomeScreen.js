import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, query, orderBy, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase/fbConfig';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState({}); // Stores reply text for each question
  const [expandedQuestionId, setExpandedQuestionId] = useState(null); // Tracks which question is expanded
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile data
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

  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    return userProfile?.displayName || user?.displayName || 'Anonymous';
  };

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched questions:', questionsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const createNotification = async (userId, type, questionId, questionText, actorId) => {
    if (!userId || !type || !questionId || !questionText || !actorId) {
      console.error('Missing required notification data:', { userId, type, questionId, questionText, actorId });
      return;
    }

    try {
      console.log('Creating notification with data:', {
        userId,
        type,
        questionId,
        questionText,
        actorId,
        actorName: getUserDisplayName()
      });

      const notificationsRef = collection(db, 'notifications');
      const notificationData = {
        userId,
        type,
        questionId,
        questionText,
        actorId,
        actorName: getUserDisplayName(),
        timestamp: serverTimestamp(),
        read: false
      };

      const docRef = await addDoc(notificationsRef, notificationData);
      console.log('Notification created successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const postQuestion = async () => {
    if (newQuestion.trim() === '') return;
    if (!user) {
      console.error('User must be logged in to post a question');
      return;
    }
    try {
      const questionsRef = collection(db, 'questions');
      await addDoc(questionsRef, {
        text: newQuestion,
        likes: 0,
        replies: [],
        timestamp: serverTimestamp(),
        userId: user.uid,
        userName: getUserDisplayName()
      });
      setNewQuestion('');
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  const postReply = async (questionId, questionUserId, questionText) => {
    if (!newReply[questionId]?.trim()) return;
    if (!user) {
      console.error('User must be logged in to post a reply');
      return;
    }

    console.log('Posting reply with data:', {
      questionId,
      questionUserId,
      questionText,
      currentUserId: user.uid
    });

    try {
      const questionRef = doc(db, 'questions', questionId);
      const replyData = {
        text: newReply[questionId],
        userId: user.uid,
        userName: getUserDisplayName(),
        timestamp: new Date().toISOString()
      };
      
      // First get the current replies array
      const questionDoc = await getDoc(questionRef);
      const currentReplies = questionDoc.data()?.replies || [];
      
      // Add the new reply to the array
      const updatedReplies = [...currentReplies, replyData];
      
      // Update the document with the new array
      await updateDoc(questionRef, {
        replies: updatedReplies
      });

      // Create notification for the question owner
      if (questionUserId && questionUserId !== user.uid) {
        console.log('Creating notification for question owner:', {
          questionUserId,
          currentUserId: user.uid
        });
        await createNotification(
          questionUserId,
          'reply',
          questionId,
          questionText,
          user.uid
        );
      } else {
        console.log('Skipping notification creation:', {
          reason: !questionUserId ? 'No question owner ID' : 'Same user',
          questionUserId,
          currentUserId: user.uid
        });
      }

      setNewReply({ ...newReply, [questionId]: '' }); // Clear the reply input
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const likeQuestion = async (questionId, questionUserId, questionText) => {
    if (!user) {
      console.error('User must be logged in to like a question');
      return;
    }
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid)
      });

      // Create notification for the question owner
      if (questionUserId && questionUserId !== user.uid) {
        await createNotification(
          questionUserId,
          'like',
          questionId,
          questionText,
          user.uid
        );
      }

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
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#6200ee" />
        </TouchableOpacity>
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
            {/* Question Text and Author */}
            <View style={styles.questionHeader}>
              <Text style={styles.questionText}>{item.text}</Text>
              <Text style={styles.authorText}>Posted by: {item.userName}</Text>
            </View>

            {/* Like and Show Replies Buttons */}
            <View style={styles.actionsContainer}>
              {/* Like Button */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => likeQuestion(item._id, item.userId, item.text)}
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
                      <Text style={styles.replyText}>{reply.text}</Text>
                      <Text style={styles.replyAuthor}>By: {reply.userName}</Text>
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
  questionHeader: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  replyAuthor: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  notificationButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
});

export default HomeScreen;