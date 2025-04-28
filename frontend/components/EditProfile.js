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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase/fbConfig";
import { deleteAccount } from "../firebase/authServices";
import { useAuth } from "../contexts/AuthContext";

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

        // Clear the text inputs
        setFirstName("");
        setLastName("");
      } else if (editMode === "password") {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          Alert.alert("Error", "Please fill in all fields.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          Alert.alert("Error", "New passwords do not match.");
          return;
        }

        // Reauthenticate and update password
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        Alert.alert("Success", "Password updated successfully!");

        // Clear the text inputs
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
        {
          text: "Cancel",
          style: "cancel",
        },
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#6200ee" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            editMode === "details" && styles.activeModeButton,
          ]}
          onPress={() => setEditMode("details")}
        >
          <Text
            style={editMode === "details" ? styles.activeModeText : styles.modeText}
          >
            Edit Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            editMode === "password" && styles.activeModeButton,
          ]}
          onPress={() => setEditMode("password")}
        >
          <Text
            style={editMode === "password" ? styles.activeModeText : styles.modeText}
          >
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            editMode === "delete" && styles.activeModeButton,
          ]}
          onPress={() => setEditMode("delete")}
        >
          <Text
            style={editMode === "delete" ? styles.activeModeText : styles.modeText}
          >
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Form */}
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
              <Text style={styles.deleteWarning}>
                Warning: This action cannot be undone. All your data will be permanently deleted.
              </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  saveButton: {
    color: "#6200ee",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    color: "#6200ee",
    fontSize: 16,
    fontWeight: "bold",
  },
  modeToggle: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  modeButton: {
    padding: 10,
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: "#6200ee",
  },
  modeText: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  activeModeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  deleteContainer: {
    padding: 20,
  },
  deleteWarning: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfile;