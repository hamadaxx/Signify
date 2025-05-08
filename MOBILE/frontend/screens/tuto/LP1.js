import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";

const LP1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/LP/LP1.png")} style={styles.image} />
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Text style={styles.title}>Signify</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={() => navigation.navigate("LP4")} // Navigate to SignIn instead of MainApp
        >
          <Text style={styles.SkipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.continueButton]}
          onPress={() => navigation.navigate("LP2")} // Go to LP2
        >
          <Text style={styles.ContinueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles remain the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#3B82F6',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100, // Half of width and height to make it round
    marginBottom: 20,
    borderWidth: 3, // Optional: Add a border
    borderColor: "#374ef5", // Optional: Border color matching the theme
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 10,
    color: "#fff", // Darker text for better readability
  },
  title: {
    fontSize: 32, // Slightly larger for emphasis
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f7a803", // Matching the theme color
    paddingBottom: 40,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#555", // Slightly lighter for contrast
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 15,
    borderRadius: 25, // More rounded corners for buttons
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  skipButton: {
    backgroundColor: "#eaeaea",
  },
  continueButton: {
    backgroundColor: "#374ef5",
  },
  ContinueButtonText: {
    color: "#fff", // White text for better contrast on the blue button
    fontSize: 16,
    fontWeight: "bold", // Bold text for emphasis
  },
  SkipButtonText: {
    color: "#374ef5",
    fontSize: 16,
    fontWeight: "bold", // Bold text for emphasis
  },
});

export default LP1;