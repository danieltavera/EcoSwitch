import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SignUpNavigationProp } from '../../types/navigation';

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpNavigationProp>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    // Validaciones básicas
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('User registration response:', data);
        const newUserId = data.user?.id || data.id || data.userId;
        
        if (!newUserId) {
          console.error('No user ID received from registration:', data);
          Alert.alert('Error', 'Registration successful but no user ID received. Please try logging in.');
          return;
        }

        Alert.alert(
          'Success', 
          'User successfully registered',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('WelcomeSetup', { userId: newUserId })
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Error registering user');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
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
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us in making a greener future</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholderTextColor="#888"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              placeholderTextColor="#888"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              placeholderTextColor="#888"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonIcon}>🌱</Text>
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Registrando...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity style={styles.signInLink} onPress={handleSignIn}>
            <Text style={styles.signInLinkText}>Already have an account? </Text>
            <Text style={styles.signInLinkHighlight}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50, // Añadir padding inferior para mejor scroll
  },
  container: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    minHeight: '100%', // Asegurar altura mínima
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: -30,
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  halfInput: {
    width: '48%',
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
    marginBottom: 24,
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
  primaryButtonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
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
  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInLinkText: {
    fontSize: 16,
    color: '#888',
  },
  signInLinkHighlight: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;