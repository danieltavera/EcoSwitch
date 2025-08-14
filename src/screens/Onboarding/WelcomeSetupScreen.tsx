import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WelcomeSetupNavigationProp, RouteProp } from '../../types/navigation';

const WelcomeSetupScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeSetupNavigationProp>();
  const route = useRoute<RouteProp<'WelcomeSetup'>>();
  const { userId } = route.params || {};

  const handleCompleteSetup = () => {
    if (userId) {
      navigation.navigate('HomeData', { userId });
    } else {
      console.error('No userId available for setup');
      // Fallback - maybe navigate to login
      navigation.navigate('Login');
    }
  };

  const handleSkipForNow = () => {
    navigation.navigate('WelcomeDashboard', { userId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.welcomeIcon}>🌱</Text>
            <Text style={styles.title}>Welcome to EcoSwitch!</Text>
            <Text style={styles.subtitle}>
              Your account has been created successfully. Now let's set up your energy profile to get personalized recommendations.
            </Text>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What you'll get with setup:</Text>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🏠</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Personalized Dashboard</Text>
                <Text style={styles.benefitDescription}>
                  Track your energy usage based on your home type and size
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Custom Recommendations</Text>
                <Text style={styles.benefitDescription}>
                  Get tailored suggestions to reach your energy goals
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💰</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Savings Tracking</Text>
                <Text style={styles.benefitDescription}>
                  Monitor your progress and see real cost savings
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.setupInfo}>
            <Text style={styles.setupTimeText}>⏱️ Takes only 2 minutes</Text>
            <Text style={styles.setupStepsText}>Just 2 simple steps to complete</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.completeButton} 
              onPress={handleCompleteSetup}
            >
              <Text style={styles.completeButtonIcon}>🚀</Text>
              <Text style={styles.completeButtonText}>Complete Setup</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkipForNow}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
              <Text style={styles.skipButtonSubtext}>You can complete this later</Text>
            </TouchableOpacity>
          </View>
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
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  setupInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  setupTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  setupStepsText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  buttonsContainer: {
    gap: 16,
  },
  completeButton: {
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
  completeButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  skipButtonSubtext: {
    color: '#888',
    fontSize: 12,
  },
});

export default WelcomeSetupScreen;
