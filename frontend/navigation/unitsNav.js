//Units Stack
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LearnScreen from '../screens/main/LearnScreen';
import Lessons from '../screens/main/Lessons';
import LessonDetail from '../screens/main/LessonDetail';
import quizScreen from '../screens/quiz/quizScreen';
import quizResults from '../screens/quiz/quizResults';

const Stack = createStackNavigator();

const UnitStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
        detachPreviousScreen: false,
      }}
    >
      <Stack.Screen 
        name="LearnScreen" 
        component={LearnScreen} 
        options={{ tabBarVisible: true }}
      />
      <Stack.Screen 
        name="Lessons" 
        component={Lessons} 
        options={{ tabBarVisible: false }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetail} 
        options={{ tabBarVisible: false }}
      />
      <Stack.Screen 
        name="quizScreen" 
        component={quizScreen} 
        options={{ tabBarVisible: false }}
      />
      <Stack.Screen 
        name="quizResults" 
        component={quizResults} 
        options={{ tabBarVisible: false }}
      />
    </Stack.Navigator>
  );
};

export default UnitStack;