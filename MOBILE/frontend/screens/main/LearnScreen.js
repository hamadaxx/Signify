import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { db } from "../../firebase/fbConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import ProgressHeader from "../../components/progress_header";
import { useProgress } from "../../contexts/ProgressContext";

const screenWidth = Dimensions.get("window").width;

// Import all unit images statically
// Add all your unit images here
const unitImages = {
  "alpha.png": require("../../assets/units/alpha.png"),
  "book.png": require("../../assets/units/book.png"),
  "Chat Talking.png": require("../../assets/units/Chat Talking.png"),
  "everyday_signs.png": require("../../assets/units/everyday_signs.png"),
  "facial_expressions.png": require("../../assets/units/facial_expressions.png"),
  "Family.png": require("../../assets/units/Family.png"),
  "Graduation Book.png": require("../../assets/units/Graduation Book.png"),
  "ha.png": require("../../assets/units/ha.png"),
  "introduction.png": require("../../assets/units/introduction.png"),
  "numbers.png": require("../../assets/units/numbers.png"),
  "small_talk.png": require("../../assets/units/small_talk.png"),
  "Star.png": require("../../assets/units/Star.png"),
  "unit1.png": require("../../assets/units/unit1.png"),
  "unit2.png": require("../../assets/units/unit2.png"),
  "unit3.png": require("../../assets/units/unit3.png"),
  "unit4.png": require("../../assets/units/unit4.png")
};

const LearnScreen = () => {
  const navigation = useNavigation();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isUnitCompleted, getUnitProgress, refreshProgress } = useProgress();
  const [lastRefresh, setLastRefresh] = useState(Date.now());


  const fetchUnits = async (forceRefresh = false) => {
    try {
      // Only refresh if forced or if it's been more than 5 minutes since last refresh
      const shouldRefresh = forceRefresh || (Date.now() - lastRefresh > 5 * 60 * 1000);

      if (!shouldRefresh) return;

      setLoading(true);
      await refreshProgress();

      const unitsRef = collection(db, "units");
      const q = query(unitsRef, orderBy("unitOrder", "asc"));
      const querySnapshot = await getDocs(q);

      const unitsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const videosRef = collection(db, "units", doc.id, "videos");
          const videosSnapshot = await getDocs(videosRef);
          const totalVideos = videosSnapshot.size;

          const progress = await getUnitProgress(doc.id);
          const completed = isUnitCompleted(doc.id);

          return {
            id: doc.id,
            ...doc.data(),
            lessonCount: totalVideos,
            progress: Math.round(progress),
            completed
          };
        })
      );

      setUnits(unitsData);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnits(true);
  }, []);

  // Only refresh when screen comes into focus if it's been more than 5 minutes
  useFocusEffect(
    React.useCallback(() => {
      fetchUnits();
    }, [])
  );

  const handleUnitPress = (unit) => {
    navigation.navigate("Lessons", {
      unitId: unit.id,
      unitTitle: unit.title,
    });
  };

  // Function to get the correct image source based on the imagePath
  const getImageSource = (imagePath) => {
    // If the imagePath is a key in our unitImages object, use that
    if (unitImages[imagePath]) {
      return unitImages[imagePath];
    }

    // Otherwise, return the default image
    return require("../../assets/units/book.png");
  };

  const renderUnit = ({ item }) => (
    <TouchableOpacity
      style={styles.unitCard}
      onPress={() => handleUnitPress(item)}
    >
      <Image
        source={getImageSource(item.imagePath)}
        style={styles.unitImage}
        defaultSource={require("../../assets/units/book.png")}
        onError={(e) => {
          console.error(`Error loading image for unit ${item.id}:`, e.nativeEvent.error);
          console.log(`Failed image path: ${item.imagePath}`);
        }}
      />
      <Text style={styles.unitTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.lessonsText}>{`${item.lessonCount} lessons`}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${item.progress}%` },
          ]}
        />
      </View>
      {item.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && units.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading units...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressHeader />
      {/* Daily Challenge Button */}
      <TouchableOpacity
        style={styles.dailyChallengeButton}
        onPress={() => navigation.navigate('DailyChallenge')}
        activeOpacity={0.8}
      >

        <Text style={styles.dailyChallengeText}>🔥 Daily Challenge</Text>
        <Text style={styles.dailyChallengeSubtitle}>Test your ASL skills today!</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>

      ) : units.length > 0 ? (
        <FlatList
          data={units}
          renderItem={renderUnit}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.unitList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No units available yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },
  dailyChallengeButton: {
    backgroundColor: '#ffe066',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dailyChallengeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dailyChallengeSubtitle: {
    fontSize: 14,
    color: '#555',
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
  unitList: {
    
    paddingHorizontal: 5 ,
    paddingTop: 8,
    paddingBottom: 90, // Add padding to account for the bottom tab bar
  },
  unitCard: {
    width: screenWidth * 0.45,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  unitImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 8,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  lessonsText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginTop : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
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

export default LearnScreen;