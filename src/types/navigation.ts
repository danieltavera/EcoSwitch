import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';

// Definición de tipos para las rutas de navegación
export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  WelcomeSetup: { userId?: string };
  WelcomeDashboard: { userId?: string };
  InitialSetup: undefined;
  HomeData: { userId?: string };
  BaseConsumption: { userId?: string };
  Dashboard: { userId?: string };
  Consumption: undefined;
  Profile: undefined;
  Challenges: undefined;
  Education: undefined;
  Notifications: { userId?: string };
};

// Tipos para navigation prop
export type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;

// Tipos para route prop
export type RouteProp<T extends keyof RootStackParamList> = NavigationRouteProp<
  RootStackParamList,
  T
>;

// Tipos específicos para cada pantalla
export type LoginNavigationProp = NavigationProp<'Login'>;
export type SignInNavigationProp = NavigationProp<'SignIn'>;
export type SignUpNavigationProp = NavigationProp<'SignUp'>;
export type ForgotPasswordNavigationProp = NavigationProp<'ForgotPassword'>;
export type ResetPasswordNavigationProp = NavigationProp<'ResetPassword'>;
export type WelcomeSetupNavigationProp = NavigationProp<'WelcomeSetup'>;
export type WelcomeDashboardNavigationProp = NavigationProp<'WelcomeDashboard'>;
export type InitialSetupNavigationProp = NavigationProp<'InitialSetup'>;
export type HomeDataNavigationProp = NavigationProp<'HomeData'>;
export type BaseConsumptionNavigationProp = NavigationProp<'BaseConsumption'>;
export type DashboardNavigationProp = NavigationProp<'Dashboard'>;
export type ConsumptionNavigationProp = NavigationProp<'Consumption'>;
export type ProfileNavigationProp = NavigationProp<'Profile'>;
export type ChallengesNavigationProp = NavigationProp<'Challenges'>;
export type EducationNavigationProp = NavigationProp<'Education'>;
export type NotificationNavigationProp = NavigationProp<'Notifications'>;
