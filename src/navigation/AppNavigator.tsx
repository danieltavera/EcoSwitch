import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import WelcomeSetupScreen from '../screens/Onboarding/WelcomeSetupScreen';
import WelcomeDashboardScreen from '../screens/Onboarding/WelcomeDashboardScreen';
import InitialSetupScreen from '../screens/Onboarding/InitialSetupScreen';
import HomeDataScreen from '../screens/Onboarding/HomeDataScreen';
import BaseConsumptionScreen from '../screens/Onboarding/BaseConsumptionScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ConsumptionScreen from '../screens/Consumption/ConsumptionScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChallengesScreen from '../screens/Challenges/ChallengesScreen';
import EducationScreen from '../screens/Education/EducationScreen';
import NotificationScreen from '../screens/Notifications/NotificationScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="InitialSetup">
      <Stack.Screen
        name="InitialSetup"
        component={InitialSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WelcomeSetup"
        component={WelcomeSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WelcomeDashboard"
        component={WelcomeDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeData"
        component={HomeDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BaseConsumption"
        component={BaseConsumptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false  // Disable swipe back gesture
        }}
      />
      <Stack.Screen
        name="Consumption"
        component={ConsumptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Education"
        component={EducationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;