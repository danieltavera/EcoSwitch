import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { InitialSetupNavigationProp } from '../../types/navigation';

const InitialSetupScreen: React.FC = () => {
  const navigation = useNavigation<InitialSetupNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };


  return (
    <LinearGradient
      colors={['#2E7D32', '#43A047', '#66BB6A', '#A5D6A7', '#BDBDBD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      locations={[0, 0.3, 0.6, 0.85, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/ecoswitch_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>ECOSWITCH</Text>
            <Text style={styles.logoSubtext}>ENERGY TRACKER</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Welcome to the Future of Energy!</Text>
            <Text style={styles.title}>Track, Save & Go Green</Text>
            <Text style={styles.subtitle}>
              Take control of your energy consumption with smart tracking, personalized insights, and actionable tips to reduce your environmental impact.
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Track Your Usage</Text>
                  <Text style={styles.featureDescription}>Monitor electricity, gas & water consumption</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Set Energy Goals</Text>
                  <Text style={styles.featureDescription}>Define targets and track your progress towards them</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💡</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Personalized Tips</Text>
                  <Text style={styles.featureDescription}>Get smart recommendations to reduce energy consumption</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💰</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Save Money</Text>
                  <Text style={styles.featureDescription}>Reduce bills with personalized insights and tracking</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonIcon}>🚀</Text>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
           
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: -12,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#E8F5E8',
    letterSpacing: 2,
    marginTop: 4,
    opacity: 0.9,
  },
  contentContainer: {
    paddingHorizontal: 26,
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#E8F5E8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
    paddingHorizontal: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E8F5E8',
    opacity: 0.9,
    lineHeight: 18,
  },

  // Buttons Sizes
  buttonContainer: {
    paddingBottom: 30,
    paddingHorizontal: 60,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#2E7D32',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#E8F5E8',
    fontSize: 16,
    fontWeight: '500',
    opacity: 3,
  },
});

export default InitialSetupScreen;
