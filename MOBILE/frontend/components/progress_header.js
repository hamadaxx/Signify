import { StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect } from "react";
import { useProgress } from "../contexts/ProgressContext";

const ProgressHeader = () => {
  const { 
    userProgress, 
    currentBadge, 
    streak, 
    streakFreeze, 
    awardDailyLoginBonus,
    refreshProgress
  } = useProgress();

  // Award daily login bonus and refresh progress when component mounts
  useEffect(() => {
    const initializeProgress = async () => {
      await awardDailyLoginBonus();
      await refreshProgress();
    };
    
    initializeProgress();
  }, []);

  // Calculate points to next badge
  const getPointsToNextBadge = () => {
    if (!userProgress?.points) return 0;
    
    const points = userProgress.points;
    
    if (points >= 1000) return 0; // Master badge
    if (points >= 600) return 1000 - points; // Points to Master
    if (points >= 300) return 600 - points; // Points to Fluent
    if (points >= 150) return 300 - points; // Points to Skilled
    if (points >= 50) return 150 - points; // Points to Learner
    
    return 50 - points; // Points to Beginner
  };

  const pointsToNextBadge = getPointsToNextBadge();
  const hasNextBadge = pointsToNextBadge > 0;

  return (
    <View style={styles.progress_container}>
      {/* Points Section */}
      <View style={styles.iconContainer}>
        <Image source={require("../assets/units/Star.png")} style={styles.image} />
        <View style={styles.underline} />
        <Text style={styles.label}>Points</Text>
        <Text style={styles.value}>{userProgress?.points || 0}</Text>
        {hasNextBadge && (
          <Text style={styles.nextBadgeText}>
            {pointsToNextBadge} to next badge
          </Text>
        )}
      </View>

      {/* Streak Section */}
      <View style={styles.iconContainer}>
        <Image source={require("../assets/Fire.png")} style={styles.image} />
        <View style={styles.underline} />
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}</Text>
        {streakFreeze && (
          <Text style={styles.freezeText}>Freeze Active</Text>
        )}
      </View>

      {/* Badge Section */}
      <View style={styles.iconContainer}>
        <Image source={require("../assets/hand.png")} style={styles.image} />
        <View style={styles.underline} />
        <Text style={styles.label}>Badge</Text>
        <Text style={styles.value}>{currentBadge?.name || "None"}</Text>
        {currentBadge && (
          <Text style={styles.badgeIcon}>{currentBadge.icon}</Text>
        )}
      </View>
    </View>
  );
};

export default ProgressHeader;

const styles = StyleSheet.create({
  progress_container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  image: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  underline: {
    height: 2,
    width: "80%",
    backgroundColor: "#3B82F6",
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  nextBadgeText: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  freezeText: {
    fontSize: 10,
    color: "#3B82F6",
    marginTop: 2,
    textAlign: "center",
  },
  badgeIcon: {
    fontSize: 16,
    marginTop: 2,
  },
});