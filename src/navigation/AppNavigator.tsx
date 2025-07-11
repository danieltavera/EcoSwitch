import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import InitialSetupScreen from '../screens/Onboarding/InitialSetupScreen';
import HomeDataScreen from '../screens/Onboarding/HomeDataScreen';
import BaseConsumptionScreen from '../screens/Onboarding/BaseConsumptionScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ConsumptionScreen from '../screens/Consumption/ConsumptionScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
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
        name="InitialSetup"
        component={InitialSetupScreen}
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Consumption"
        component={ConsumptionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;