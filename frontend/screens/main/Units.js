import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLearning } from '../../contexts/LearningContext';
import { Ionicons } from '@expo/vector-icons';

const Units = ({ navigation }) => {
  const { units, loading, userProgress, navigateToUnit } = useLearning();

  const renderUnitItem = ({ item }) => {
    const isCompleted = userProgress?.completedUnits?.includes(item.id);
    const progress = item.progress || 0;
    
    return (
      <TouchableOpacity
        style={styles.unitCard}
        onPress={() => navigateToUnit(item.id)}
      >
        <View style={styles.unitImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.unitImage} />
          ) : (
            <View style={styles.unitImagePlaceholder}>
              <Ionicons name="book-outline" size={40} color="#6200ee" />
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
        
        <View style={styles.unitInfo}>
          <Text style={styles.unitTitle}>{item.title}</Text>
          <Text style={styles.unitDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={24} color="#6200ee" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading units...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learning Units</Text>
      
      {units.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={60} color="#6200ee" />
          <Text style={styles.emptyText}>No units available yet</Text>
        </View>
      ) : (
        <FlatList
          data={units}
          renderItem={renderUnitItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200ee',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  unitCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  unitImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  unitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  unitImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  unitInfo: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  unitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
});

export default Units; 