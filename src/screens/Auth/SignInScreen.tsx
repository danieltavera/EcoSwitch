import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SignInNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInNavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    // Reset previous errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email.trim().toLowerCase(), password);
      
      // Login successful - check if user has completed onboarding
      const checkOnboardingStatus = async () => {
        try {
          const API_BASE_URL = __DEV__ 
            ? 'http://10.0.0.21:3000'
            : 'https://your-production-api-url.com';
          
          // Get user from database
          const userResponse = await fetch(`${API_BASE_URL}/api/energy-consumption/users/all`);
          const userData = await userResponse.json();
          
          if (userData.success && userData.data.length > 0) {
            const user = userData.data[0];
            const userId = user.id;
            
            console.log('SignInScreen - Found user:', userId);
            console.log('SignInScreen - User has household_id:', user.household_id);
            
            // Check if user has household_id (completed onboarding)
            if (user.household_id) {
              // User completed onboarding, go to dashboard
              Alert.alert(
                'Welcome Back!',
                'Taking you to your dashboard.',
                [
                  {
                    text: 'Continue',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Dashboard', params: { userId } }],
                      });
                    }
                  }
                ]
              );
            } else {
              // User needs to complete onboarding
              Alert.alert(
                'Welcome!',
                'Let\'s set up your energy profile.',
                [
                  {
                    text: 'Continue',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'HomeData', params: { userId } }],
                      });
                    }
                  }
                ]
              );
            }
          } else {
            throw new Error('No user found');
          }
        } catch (error) {
          console.error('SignInScreen - Error checking onboarding status:', error);
          // Fallback to HomeData if there's an error
          Alert.alert(
            'Welcome!',
            'Sign in successful',
            [
              {
                text: 'Continue',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeData' }],
                  });
                }
              }
            ]
          );
        }
      };
      
      await checkOnboardingStatus();
      
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Credenciales inválidas') || 
            error.message.includes('Invalid credentials') ||
            error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }
      
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/ecoswitch_logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>ECOSWITCH</Text>
          <Text style={styles.logoSubtext}>ENERGY TRACKER</Text>
        </View>
        
        <Text style={styles.title}>Sign In</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(''); // Clear error when user types
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
            editable={!isLoading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(''); // Clear error when user types
            }}
            secureTextEntry
            placeholderTextColor="#888"
            editable={!isLoading}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 12 }} />
          ) : (
            <Text style={styles.primaryButtonIcon}>🔑</Text>
          )}
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TouchableOpacity style={styles.signUpLink} onPress={handleSignUp}>
          <Text style={styles.signUpLinkText}>Don't have an account? </Text>
          <Text style={styles.signUpLinkHighlight}>Sign Up</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50, // Añadir padding inferior
  },
  container: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 210,
    height: 210,
    marginBottom: -45,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 13,
    color: '#66BB6A',
    letterSpacing: 3,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 32,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#888',
  },

  signUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 16,
    color: '#888',
  },
  signUpLinkHighlight: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0.1,
  },
});

export default SignInScreen;