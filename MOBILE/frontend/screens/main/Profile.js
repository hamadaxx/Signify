import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOutUser } from "../../firebase/authServices";
import { useAuth } from "../../contexts/AuthContext";
import { useProgress } from "../../contexts/ProgressContext";
import { Ionicons } from "@expo/vector-icons";
import { BADGES } from "../../contexts/ProgressContext";
import { LinearGradient } from 'expo-linear-gradient';

const Profile = () => {
  const navigation = useNavigation();
  const { user, userProfile } = useAuth();
  const { userProgress, currentBadge, streak } = useProgress();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigation.navigate("LP4");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Calculate next badge and progress
  const getNextBadge = () => {
    if (!userProgress?.points) return null;
    
    const points = userProgress.points;
    const badges = Object.values(BADGES);
    
    for (let i = 0; i < badges.length; i++) {
      if (points < badges[i].points) {
        return {
          badge: badges[i],
          progress: (points / badges[i].points) * 100
        };
      }
    }
    
    return null;
  };

  const nextBadge = getNextBadge();

  if (!user || !userProfile) {
    return (
      <View style={styles.container}>
        <Text>No user is currently logged in.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.profileHeader}>
        <Image
          source={userProfile?.profilePicture ? { uri: userProfile.profilePicture } : require("../../assets/LP/LP1.png")}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {`${userProfile.firstName} ${userProfile.lastName}`}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        {/* Current Badge */}
        {currentBadge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeIcon}>{currentBadge.icon}</Text>
            <Text style={styles.badgeName}>{currentBadge.name}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{userProgress?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="book" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>
              {userProgress?.completedLessons?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>
              {userProgress?.completedUnits?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Units</Text>
          </View>
        </View>

        {/* Next Badge Progress */}
        {nextBadge && (
          <View style={styles.nextBadgeContainer}>
            <Text style={styles.nextBadgeTitle}>Next Badge: {nextBadge.badge.name}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${nextBadge.progress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(nextBadge.progress)}% Complete
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    paddingBottom: 90, // Add padding to account for the bottom tab bar
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#3B82F6",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  userEmail: {
    fontSize: 16,
    color: "#fff",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#374ef5",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  nextBadgeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nextBadgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  signOutButton: {
    margin: 20,
    padding: 20,
   
    backgroundColor: "red",
    borderRadius: 16,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Profile;
