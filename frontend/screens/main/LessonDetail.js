import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from "@expo/vector-icons";
import { fetchVideo, fetchVideos } from "../../firebase/vidServices"; // ✅ Notice: fetchVideo and fetchVideos
import { useProgress } from "../../contexts/ProgressContext";

const { width } = Dimensions.get('window');

const LessonDetail = ({ route, navigation }) => {
  const { unitId, videoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { completeLesson, isLessonCompleted, refreshProgress } = useProgress();

  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshProgress();

        // Load all videos to navigate between them
        const videos = await fetchVideos(unitId);
        setAllVideos(videos);

        const index = videos.findIndex(v => v.id === videoId);
        if (index >= 0) setCurrentIndex(index);

        // Load the current video details
        const videoData = await fetchVideo(unitId, videoId);
        const id = getYouTubeVideoId(videoData.videoURL);

        setVideoTitle(videoData.title || 'Lesson');
        setDescription(videoData.description || '');
        setYoutubeVideoId(id);

        const completed = isLessonCompleted(videoId);
        setIsRepeat(completed);
        setWatched(completed);
      } catch (error) {
        console.error("Error loading video:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [unitId, videoId, isLessonCompleted, refreshProgress]);

  const navigateToVideo = useCallback((index) => {
    if (index >= 0 && index < allVideos.length) {
      const video = allVideos[index];
      navigation.replace("LessonDetail", { // ✅ use replace not navigate to avoid stacking screens
        unitId,
        videoId: video.id,
      });
    }
  }, [allVideos, navigation, unitId]);

  const markAsWatched = useCallback(async () => {
    try {
      setLoading(true);

      const alreadyCompleted = isLessonCompleted(videoId);
      if (alreadyCompleted) {
        Alert.alert("Info", "This lesson was already completed!", [{ text: "OK" }]);
        return;
      }

      const success = await completeLesson(videoId, unitId);
      if (success) {
        setWatched(true);
        setIsRepeat(true);
        Alert.alert("Success", "Lesson marked as completed!", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", "Failed to mark lesson as completed.", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Error marking as watched:", error);
      Alert.alert("Error", "Failed to mark lesson as completed.", [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  }, [completeLesson, unitId, videoId, isLessonCompleted]);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{videoTitle}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.videoWrapper}>
          <View style={styles.videoContainer}>
            {youtubeVideoId ? (
              <YoutubePlayer
                height={(width - 32) * 0.5625}
                width={width - 32}
                videoId={youtubeVideoId}
                play={false}
              />
            ) : (
              <Text>Invalid YouTube link</Text>
            )}
          </View>
        </View>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.pointsInfo}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.pointsText}>
            {isRepeat ? "You've already earned points" : "Complete to earn points"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, watched && { backgroundColor: "#4CAF50" }]}
          onPress={markAsWatched}
          disabled={watched || loading}
        >
          <Ionicons
            name={watched ? "checkmark-circle" : "play-circle"}
            size={24}
            color="#fff"
          />
          <Text style={styles.completeButtonText}>
            {watched ? "Completed" : "Mark as Watched"}
          </Text>
        </TouchableOpacity>

        {/* ✅ Next / Previous buttons restored */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
            onPress={() => navigateToVideo(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === allVideos.length - 1 && styles.disabledButton]}
            onPress={() => navigateToVideo(currentIndex + 1)}
            disabled={currentIndex === allVideos.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  videoWrapper: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
  },
  videoContainer: {
    width: width - 32,
    height: (width - 32) * 0.5625,
    backgroundColor: '#000',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  pointsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  pointsText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 24,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#3B82F6',
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
});

export default LessonDetail;
