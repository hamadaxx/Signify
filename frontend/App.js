import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./contexts/AuthContext";
import { LearningProvider } from "./contexts/LearningContext";
import { ProgressProvider } from "./contexts/ProgressContext";

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <LearningProvider>
          <SafeAreaView style={styles.safeArea}>
            <AppNavigator />
            <StatusBar style="auto" />
          </SafeAreaView>
        </LearningProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
