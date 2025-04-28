import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db } from "../../firebase/fbConfig";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useProgress } from "../../contexts/ProgressContext";

const Lessons = ({ route }) => {
  const { unitId, unitTitle } = route.params;
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLessonCompleted, refreshProgress } = useProgress();

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const loadVideos = async () => {
      try {
        setLoading(true);
        
        // Only refresh progress if needed
        const videosRef = collection(db, "units", unitId, "videos");
        const q = query(videosRef, orderBy("vidOrder", "asc"));
        
        // Initial load using getDocs for faster loading
        const querySnapshot = await getDocs(q);
        const initialVideos = querySnapshot.docs.map(doc => {
          const videoData = doc.data();
          const completed = isLessonCompleted(doc.id);
          return {
            id: doc.id,
            ...videoData,
            watched: completed
          };
        });
        
        if (mounted) {
          setVideos(initialVideos);
          setLoading(false);
        }
        
        // Set up real-time listener for updates
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!mounted) return;
          
          const updatedVideos = snapshot.docs.map(doc => {
            const videoData = doc.data();
            const completed = isLessonCompleted(doc.id);
            return {
              id: doc.id,
              ...videoData,
              watched: completed
            };
          });
          
          // Only update if there are actual changes
          if (JSON.stringify(updatedVideos) !== JSON.stringify(videos)) {
            setVideos(updatedVideos);
          }
        });
      } catch (error) {
        console.error("Error loading videos:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    // Cleanup function
    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unitId, isLessonCompleted]);

  const handleVideoPress = useCallback((video) => {
    navigation.navigate("LessonDetail", {
      videoId: video.id,
      unitId,
      videoTitle: video.title,
      videoUrl: video.videoURL,
      description: video.description
    });
  }, [navigation, unitId]);

  const renderVideoItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => handleVideoPress(item)}
      >
        <View style={styles.videoIconContainer}>
          <Ionicons
            name={item.watched ? "checkmark-circle" : "play-circle-outline"}
            size={32}
            color={item.watched ? "#4CAF50" : "#3B82F6"}
          />
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <Text style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
      </TouchableOpacity>
    );
  }, [handleVideoPress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{unitTitle}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.videoList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No lessons available yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  videoList: {
    padding: 16,
    paddingBottom: 90,
  },
  videoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  videoIconContainer: {
    marginRight: 16,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  videoDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
});

export default Lessons;