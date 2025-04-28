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
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useProgress } from "../../contexts/ProgressContext";

const Lessons = ({ route }) => {
  const { unitId, unitTitle } = route.params;
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLessonCompleted, isQuizCompleted, getQuizScore } = useProgress();

  // Set the page title in the navigation header
  useEffect(() => {
    navigation.setOptions({
      title: unitTitle,
      headerBackTitleVisible: false,
    });
  }, [navigation, unitTitle]);

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const videosRef = collection(db, "units", unitId, "videos");
        const q = query(videosRef, orderBy("vidOrder", "asc"));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!mounted) return;
          
          const videosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setVideos(videosData);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideos();
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [unitId]);

  const renderVideoItem = ({ item }) => {
    const isCompleted = isLessonCompleted(item.id);
    
    return (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => navigation.navigate("LessonDetail", {
          videoId: item.id,
          unitId,
          videoTitle: item.title,
          videoUrl: item.url,
          description: item.description
        })}
      >
        <View style={styles.videoInfo}>
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "play-circle"}
            size={24}
            color={isCompleted ? "#4CAF50" : "#3B82F6"}
          />
          <Text style={styles.videoTitle}>{item.title}</Text>
        </View>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </TouchableOpacity>
    );
  };

  const handleTakeQuiz = () => {
    navigation.navigate("quizScreen", {
      unitId,
      unitTitle
    });
  };

  const isAllLessonsCompleted = videos.every(video => isLessonCompleted(video.id));
  const quizScore = getQuizScore(unitId);
  const hasCompletedQuiz = isQuizCompleted(unitId);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <>
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={styles.quizContainer}>
            <TouchableOpacity
              style={[
                styles.quizButton,
                !isAllLessonsCompleted && styles.quizButtonDisabled
              ]}
              onPress={handleTakeQuiz}
              disabled={!isAllLessonsCompleted}
            >
              <Ionicons name="help-circle" size={24} color="#fff" />
              <Text style={styles.quizButtonText}>
                {hasCompletedQuiz ? 'Retake Quiz' : 'Take Quiz'}
              </Text>
              {hasCompletedQuiz && (
                <Text style={styles.quizScore}>Score: {quizScore}%</Text>
              )}
            </TouchableOpacity>
            {!isAllLessonsCompleted && (
              <Text style={styles.quizLockedText}>
                Complete all lessons to unlock the quiz
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
  },
  videoInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  quizContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  quizButtonDisabled: {
    backgroundColor: "#a0c4ff",
  },
  quizButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quizScore: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
  },
  quizLockedText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});

export default Lessons;
