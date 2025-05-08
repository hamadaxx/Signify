import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const LP4 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Image */}
      <Image
        source={require('../../assets/LP/LP1.png')} // Replace with your image path
        style={styles.image}
      />

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Text style={styles.title}>SIGNIFY</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.signInButton]}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100, // Circular image
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#374ef5', // Matching theme color
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 10,
    color: '#fff', // Darker text for better readability
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: "#f7a803",  // Theme color
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButton: {
    backgroundColor: '#374ef5', // Theme color
  },
  signUpButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#374ef5', // Theme color
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: '#fff', // White text for Sign In button
  },
  signUpButtonText: {
    color: '#374ef5', // Theme color for Sign Up button
  },
});

export default LP4;