import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp as NavigationRouteProp } from '@react-navigation/native';

// Definición de tipos para las rutas de navegación
export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  SignUp: undefined;
  InitialSetup: undefined;
  HomeData: undefined;
  BaseConsumption: undefined;
  Dashboard: undefined;
  Consumption: undefined;
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
export type InitialSetupNavigationProp = NavigationProp<'InitialSetup'>;
export type HomeDataNavigationProp = NavigationProp<'HomeData'>;
export type BaseConsumptionNavigationProp = NavigationProp<'BaseConsumption'>;
export type DashboardNavigationProp = NavigationProp<'Dashboard'>;
export type ConsumptionNavigationProp = NavigationProp<'Consumption'>;
