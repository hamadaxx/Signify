//Units Stack
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LearnScreen from '../screens/main/LearnScreen';
import Lessons from '../screens/main/Lessons';
import LessonDetail from '../screens/main/LessonDetail';

const Stack = createStackNavigator();

const UnitStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
        detachPreviousScreen: false,
      }}
    >
      <Stack.Screen name="LearnScreen" component={LearnScreen} />
      <Stack.Screen name="Lessons" component={Lessons} />
      <Stack.Screen name="LessonDetail" component={LessonDetail} />
    </Stack.Navigator>
  );
};

export default UnitStack;