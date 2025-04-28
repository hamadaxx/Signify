// ProfileStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/main/Profile';
import EditProfile from '../components/EditProfile'; 


const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
   
  );
};

export default ProfileStack;