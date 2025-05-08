import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebase/fbConfig";
import { deleteAccount } from "../firebase/authServices";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const EditProfile = ({ navigation }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [firstName, setFirstName] = useState(userProfile?.firstName || "");
  const [lastName, setLastName] = useState(userProfile?.lastName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState("details"); // 'details', 'password', or 'delete'

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (editMode === "details") {
        if (!firstName.trim() || !lastName.trim()) {
          Alert.alert("Error", "Please fill in all fields.");
          return;
        }

        const success = await updateUserProfile({ firstName, lastName });
        if (success) {
          Alert.alert("Success", "Profile updated successfully!");
          navigation.goBack();
        }
      } else if (editMode === "password") {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          Alert.alert("Error", "Please fill in all fields.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          Alert.alert("Error", "New passwords do not match.");
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        Alert.alert("Success", "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigation.goBack();

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount(user.email, currentPassword);
              Alert.alert("Success", "Your account has been deleted.");
              navigation.navigate("SignIn");
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Picture Section */}
      <View style={styles.profilePicContainer}>
        <Image
          source={userProfile?.profilePicture ? { uri: userProfile.profilePicture } : require("../assets/LP/LP1.png")}
          style={styles.profilePic}
        />
        <TouchableOpacity style={styles.changePicButton}>
          <Text style={styles.changePicText}>Change Picture</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, editMode === "details" && styles.activeModeButton]}
          onPress={() => setEditMode("details")}
        >
          <Text style={editMode === "details" ? styles.activeModeText : styles.modeText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, editMode === "password" && styles.activeModeButton]}
          onPress={() => setEditMode("password")}
        >
          <Text style={editMode === "password" ? styles.activeModeText : styles.modeText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, editMode === "delete" && styles.activeModeButton]}
          onPress={() => setEditMode("delete")}
        >
          <Text style={editMode === "delete" ? styles.activeModeText : styles.modeText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Form Section */}
      <ScrollView style={styles.form}>
        {editMode === "details" ? (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={24} color="#6200ee" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={24} color="#6200ee" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </>
        ) : editMode === "password" ? (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color="#6200ee" />
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={24} color="#6200ee" />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={24} color="#6200ee" />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.deleteContainer}>
              <Text style={styles.deleteWarning}>Warning: This action cannot be undone.</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#6200ee" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password to confirm"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3B82F6", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#374ef5",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  saveButton: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Profile Picture Styles
  profilePicContainer: { alignItems: "center", marginBottom: 30 },
  profilePic: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#fff", marginBottom: 10, marginTop : 10 },
  changePicButton: { backgroundColor: "#374ef5", padding: 10, borderRadius: 25 },
  changePicText: { color: "#fff", fontWeight: "bold" },

  // Mode Toggle Styles
  modeToggle: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  modeButton: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 25 },
  
  // Updated Active and Inactive Mode Buttons
  activeModeButton: { backgroundColor: "#374ef5" },  // Active button color
  modeText: { color: "#fff", fontWeight: "bold" },  // Inactive text color
  activeModeText: { color: "#fff", fontWeight: "bold" },  // Active text color

  // Form Fields and Inputs
  form: { flex: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#000" },

  // Delete Section Styles
  deleteContainer: { padding: 20 },
  deleteWarning: { color: "red", fontSize: 16, marginBottom: 20, textAlign: "center", fontWeight:"bold" },
  deleteButton: { backgroundColor: "red", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default EditProfile;

