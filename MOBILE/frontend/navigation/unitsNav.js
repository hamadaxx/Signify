//Units Stack
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LearnScreen from '../screens/main/LearnScreen';
import Lessons from '../screens/main/Lessons';
import LessonDetail from '../screens/main/LessonDetail';
import quizScreen from '../screens/quiz/quizScreen';
import quizResults from '../screens/quiz/quizResults';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native'; // ⚡ Add this import at the top

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
        options={({ navigation }) => ({
          headerShown: true,
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'LearnScreen' }],
                  })
                );
              }}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
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