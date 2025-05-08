import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";

const LP2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/LP/LP2.png")} style={styles.image} />
      <Text style={styles.title}>Master ASL</Text>
      <Text style={styles.description}>
        Learn American Sign Language step by step with personalized lessons and
        interactive practice.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={() => navigation.navigate("LP4")} // Navigate to SignIn instead of MainApp
        >
          <Text style={styles.SkipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.continueButton]}
          onPress={() => navigation.navigate("LP3")} // Go to LP3
        >
          <Text style={styles.ContinueButtonText}>Next</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f7a803",  // Theme color
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#fff", // Slightly lighter for contrast
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 15,
    borderRadius: 25, // Rounded corners for buttons
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
    color: "#fff", // White text for contrast
    fontSize: 16,
    fontWeight: "bold",
  },
  SkipButtonText: {
    color: "#374ef5",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LP2;