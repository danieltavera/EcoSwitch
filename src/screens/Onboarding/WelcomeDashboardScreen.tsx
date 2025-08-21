import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WelcomeDashboardNavigationProp, RouteProp } from '../../types/navigation';

const WelcomeDashboardScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeDashboardNavigationProp>();
  const route = useRoute<RouteProp<'WelcomeDashboard'>>();
  const { userId } = route.params || {};
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    console.log('Navigate to Dashboard - Resetting navigation stack');
    // Reset navigation stack to prevent going back to onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: { userId } }],
    });
  };

  const handleCompleteSetupLater = () => {
    if (userId) {
      navigation.navigate('HomeData', { userId });
    } else {
      console.error('No userId available for setup');
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.welcomeIcon}>🎉</Text>
            <Text style={styles.title}>You're All Set!</Text>
            <Text style={styles.subtitle}>
              Welcome to EcoSwitch! Let's explore what you'll find in your dashboard.
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.featuresContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.featuresTitle}>Your Dashboard Features:</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📊</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Energy Overview</Text>
                <Text style={styles.featureDescription}>
                  Track your monthly electricity, gas, and water consumption in one place
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🎯</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Goals & Progress</Text>
                <Text style={styles.featureDescription}>
                  Set energy reduction targets and monitor your progress over time
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>💡</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Personalized Tips</Text>
                <Text style={styles.featureDescription}>
                  Get smart recommendations tailored to your home and energy goals
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📈</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Savings Tracking</Text>
                <Text style={styles.featureDescription}>
                  See your cost savings and environmental impact from energy reduction
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.reminderContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.reminderIcon}>⚡</Text>
            <Text style={styles.reminderTitle}>Complete Setup Later</Text>
            <Text style={styles.reminderText}>
              For personalized data and accurate recommendations, complete your home and energy setup anytime from your profile.
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.buttonsContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.getStartedButton} 
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonIcon}>🚀</Text>
              <Text style={styles.getStartedButtonText}>Explore Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.setupButton} 
              onPress={handleCompleteSetupLater}
            >
              <Text style={styles.setupButtonText}>Complete Setup Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 24,
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
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reminderContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  reminderIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
    textAlign: 'center',
  },
  reminderText: {
    fontSize: 14,
    color: '#BF360C',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  setupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  setupButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeDashboardScreen;
