import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InitialSetupNavigationProp } from '../../types/navigation';

const InitialSetupScreen: React.FC = () => {
  const navigation = useNavigation<InitialSetupNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('HomeData');
  };

  const handleSkipForNow = () => {
    console.log('Saltar configuración por ahora');
    // Aquí irá la navegación al dashboard principal cuando lo creemos
    // navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.sunLogo}>☀️</Text>
          <Text style={styles.logoText}>ECOSWITCH</Text>
          <Text style={styles.logoSubtext}>ENERGY TRACKER</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome to EcoSwitch!</Text>
          <Text style={styles.title}>Let's Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            To provide you with personalized energy insights and recommendations, 
            we'll need some basic information about your home and energy usage.
          </Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <Text style={styles.stepIcon}>🏠</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Home Information</Text>
                <Text style={styles.stepDescription}>Tell us about your living space</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepIcon}>⚡</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Energy Baseline</Text>
                <Text style={styles.stepDescription}>Set your current consumption data</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <Text style={styles.stepIcon}>🎯</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Goals & Preferences</Text>
                <Text style={styles.stepDescription}>Define your eco-friendly targets</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonIcon}>🚀</Text>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipForNow}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sunLogo: {
    fontSize: 48,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#66BB6A',
    letterSpacing: 2,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default InitialSetupScreen;
