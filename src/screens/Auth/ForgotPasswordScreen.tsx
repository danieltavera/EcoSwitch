import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ForgotPasswordNavigationProp } from '../../types/navigation';
import { forgotPasswordApi } from '../../utils/api';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = () => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await forgotPasswordApi(email.trim().toLowerCase());
      
      // Email sent successfully
      setIsEmailSent(true);
      
      Alert.alert(
        'Email Sent!',
        `We've sent password reset instructions to ${email}. Please check your inbox and follow the instructions.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('User not found') || 
            error.message.includes('Email not found') ||
            error.message.includes('404')) {
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigation.goBack();
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    handleSendResetEmail();
  };

  if (isEmailSent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackToSignIn}>
                <Text style={styles.backButton}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Success Content */}
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>📧</Text>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to:
              </Text>
              <Text style={styles.emailDisplay}>{email}</Text>
              <Text style={styles.successSubtext}>
                Click the link in the email to reset your password. 
                If you don't see it, check your spam folder.
              </Text>

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendEmail}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <Text style={styles.resendButtonText}>Resend Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backToSignInButton} 
                onPress={handleBackToSignIn}
              >
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToSignIn}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
          </View>

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

          {/* Form */}
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </Text>

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
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
            onPress={handleSendResetEmail}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 12 }} />
            ) : (
              <Text style={styles.primaryButtonIcon}>📧</Text>
            )}
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={handleBackToSignIn}>
            <Text style={styles.backLinkText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: -30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 11,
    color: '#66BB6A',
    letterSpacing: 2,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
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
  primaryButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0.1,
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
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // Success Screen Styles
  successContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  resendButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  backToSignInButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToSignInText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
