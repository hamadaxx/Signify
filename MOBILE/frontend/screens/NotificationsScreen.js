import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/fbConfig';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { clearAllCollections } from '../utils/dbUtils';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const timestampA = a.timestamp?.toDate?.() || new Date(0);
          const timestampB = b.timestamp?.toDate?.() || new Date(0);
          return timestampB - timestampA;
        });
      
      setNotifications(notificationsData);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllCollections();
              Alert.alert('Success', 'All data has been cleared successfully');
              // Refresh the notifications list
              fetchNotifications();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear database: ' + error.message);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const getNotificationText = (notification) => {
    const actorName = notification.actorName || 'Someone';
    const questionText = notification.questionText?.length > 50
      ? notification.questionText.substring(0, 50) + '...'
      : notification.questionText || '';

    switch (notification.type) {
      case 'like':
        return `${actorName} liked your question`;
      case 'reply':
        return `${actorName} replied to your question`;
      case 'mention':
        return `${actorName} mentioned you`;
      case 'follow':
        return `${actorName} started following you`;
      default:
        return 'New notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return 'heart';
      case 'reply': return 'chatbubble-ellipses';
      case 'mention': return 'at';
      case 'follow': return 'person-add';
      default: return 'notifications';
    }
  };

  const getNotificationPreview = (notification) => {
    return notification.questionText?.length > 50
      ? notification.questionText.substring(0, 50) + '...'
      : notification.questionText || '';
  };

  const renderNotification = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          markAsRead(item.id);
          if (item.questionId) {
            navigation.navigate('Home', { questionId: item.questionId });
          }
        }}
      >
        <View style={styles.notificationContent}>
          <View style={[
            styles.iconContainer,
            !item.read && styles.unreadIconContainer
          ]}>
            <Ionicons 
              name={getNotificationIcon(item.type)} 
              size={20} 
              color={!item.read ? '#FFFFFF' : '#6200ee'} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.notificationText,
              !item.read && styles.unreadText
            ]}>
              {getNotificationText(item)}
            </Text>
            {item.questionText && (
              <Text style={styles.previewText}>
                {getNotificationPreview(item)}
              </Text>
            )}
            <Text style={styles.timestamp}>
              {item.timestamp?.toDate().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={onRefresh} 
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={22} color="#6200ee" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleClearDatabase}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
            progressBackgroundColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="notifications-off" size={72} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              Your notifications will appear here when you receive them
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6200ee',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadIconContainer: {
    backgroundColor: '#6200ee',
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 4,
    lineHeight: 22,
  },
  unreadText: {
    fontWeight: '600',
    color: '#212121',
  },
  previewText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 6,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default NotificationsScreen;