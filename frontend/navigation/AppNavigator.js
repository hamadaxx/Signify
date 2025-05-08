import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Auth Screens
import SignIn from '../screens/auth/SignIn';
import SignUp from '../screens/auth/SignUp';
import LP1 from '../screens/tuto/LP1';
import LP2 from '../screens/tuto/LP2';
import LP3 from '../screens/tuto/LP3';
import LP4 from '../screens/tuto/LP4';
import DailyChallengeScreen from '../screens/quiz/DailyChallengeScreen';

// Main App Screens
import BottomTabNavigator from './BottomTabNavigator';
import QuestionDetailScreen from '../components/QuestionDetailScreen';
import PostQuestionScreen from '../components/PostQuestionScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="LP1" component={LP1} />
            <Stack.Screen name="LP2" component={LP2} />
            <Stack.Screen name="LP3" component={LP3} />
            <Stack.Screen name="LP4" component={LP4} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
            <Stack.Screen name="PostQuestion" component={PostQuestionScreen} />
            <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 