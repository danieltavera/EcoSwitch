import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ResetPassword'
>;

type ResetPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  'ResetPassword'
>;

interface Props {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
  token?: string;
}

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Token desde los parámetros de la URL o navegación
  const resetToken = route.params?.token || '';

  useEffect(() => {
    // Validar que tenemos un token
    if (!resetToken) {
      Alert.alert(
        'Invalid Link',
        'This password reset link is invalid or has expired. Please request a new one.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ForgotPassword'),
          },
        ]
      );
    }
  }, [resetToken, navigation]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Validar confirmación
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validar token
    if (!resetToken) {
      newErrors.token = 'Invalid reset token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Password Reset Successful! 🎉',
          'Your password has been updated successfully. You can now log in with your new password.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('SignIn'),
            },
          ]
        );
      } else {
        // Manejar errores específicos
        if (response.status === 400 && data.error?.includes('expired')) {
          Alert.alert(
            'Link Expired',
            'This password reset link has expired. Please request a new one.',
            [
              {
                text: 'Request New Link',
                onPress: () => navigation.navigate('ForgotPassword'),
              },
            ]
          );
        } else if (response.status === 400 && data.error?.includes('invalid')) {
          Alert.alert(
            'Invalid Link',
            'This password reset link is invalid. Please request a new one.',
            [
              {
                text: 'Request New Link',
                onPress: () => navigation.navigate('ForgotPassword'),
              },
            ]
          );
        } else {
          Alert.alert('Error', data.error || 'Failed to reset password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): string => {
    if (pwd.length < 6) return 'Too short';
    if (!/(?=.*[a-z])/.test(pwd)) return 'Need lowercase';
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Need uppercase';
    if (!/(?=.*\d)/.test(pwd)) return 'Need number';
    return 'Strong';
  };

  const getPasswordStrengthColor = (pwd: string): string => {
    const strength = getPasswordStrength(pwd);
    if (strength === 'Strong') return '#4CAF50';
    if (strength === 'Too short') return '#f44336';
    return '#FF9800';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-reset" size={50} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for your EcoSwitch account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <MaterialIcons 
                name="lock-outline" 
                size={20} 
                color={errors.password ? '#f44336' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showPassword ? 'visibility' : 'visibility-off'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <Text 
                  style={[
                    styles.strengthText, 
                    { color: getPasswordStrengthColor(password) }
                  ]}
                >
                  Strength: {getPasswordStrength(password)}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
              <MaterialIcons 
                name="lock-outline" 
                size={20} 
                color={errors.confirmPassword ? '#f44336' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            {confirmPassword.length > 0 && password === confirmPassword && (
              <View style={styles.matchIndicator}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.matchText}>Passwords match</Text>
              </View>
            )}
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.resetButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <MaterialIcons name="arrow-back" size={20} color="#4CAF50" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <MaterialIcons name="security" size={16} color="#666" />
          <Text style={styles.securityText}>
            Your password is encrypted and stored securely
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrength: {
    marginTop: 4,
    marginLeft: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  matchText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  resetButtonDisabled: {
    backgroundColor: '#a5d6a7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  securityText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 6,
    textAlign: 'center',
  },
});
