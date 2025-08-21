import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HomeDataNavigationProp, RouteProp } from '../../types/navigation';

const HomeDataScreen: React.FC = () => {
  const navigation = useNavigation<HomeDataNavigationProp>();
  const route = useRoute<RouteProp<'HomeData'>>();
  const { userId } = route.params || {};
  const [homeData, setHomeData] = useState({
    homeType: '',
    squareMeters: '',
    numberOfPeople: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [realUserId, setRealUserId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState(!userId);

  // Function to get real user from database
  const getRealUserFromDatabase = async (): Promise<string | null> => {
    try {
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'
        : 'https://your-production-api-url.com';
        
      console.log('HomeDataScreen - Calling API:', `${API_BASE_URL}/api/energy-consumption/users/all`);
      const userResponse = await fetch(`${API_BASE_URL}/api/energy-consumption/users/all`);
      
      console.log('HomeDataScreen - API Response status:', userResponse.status);
      const userData = await userResponse.json();
      console.log('HomeDataScreen - API Response data:', userData);
      
      if (userData.success && userData.data.length > 0) {
        const userId = userData.data[0].id;
        console.log('HomeDataScreen - Found real user_id from database:', userId);
        console.log('HomeDataScreen - User details:', userData.data[0]);
        return userId;
      }
      
      console.log('HomeDataScreen - No users found in database');
      return null;
    } catch (error) {
      console.error('HomeDataScreen - Error fetching user from database:', error);
      return null;
    }
  };

  // Get real user from database on component mount
  React.useEffect(() => {
    const fetchRealUser = async () => {
      if (!userId) {
        console.log('HomeDataScreen - No userId from params, fetching from database...');
        setLoadingUserId(true);
        const dbUserId = await getRealUserFromDatabase();
        console.log('HomeDataScreen - Fetched dbUserId:', dbUserId);
        setRealUserId(dbUserId);
        
        // Check if user already has household data
        if (dbUserId) {
          await checkExistingHousehold(dbUserId);
        }
        
        setLoadingUserId(false);
      } else {
        console.log('HomeDataScreen - Using userId from params:', userId);
        await checkExistingHousehold(userId);
        setLoadingUserId(false);
      }
    };
    
    fetchRealUser();
  }, [userId]);

  // Check if user already has household data
  const checkExistingHousehold = async (checkUserId: string) => {
    try {
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'
        : 'https://your-production-api-url.com';
        
      console.log('HomeDataScreen - Checking existing household for user:', checkUserId);
      const response = await fetch(`${API_BASE_URL}/api/households/user/${checkUserId}`);
      const data = await response.json();
      
      if (data.success && data.households && data.households.length > 0) {
        console.log('HomeDataScreen - User already has household, redirecting to Dashboard');
        Alert.alert(
          'Welcome Back!',
          'You have already completed the home setup. Taking you to your dashboard.',
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard', params: { userId: checkUserId } }],
                });
              }
            }
          ]
        );
      } else {
        console.log('HomeDataScreen - No existing household found, continuing with setup');
      }
    } catch (error) {
      console.error('HomeDataScreen - Error checking existing household:', error);
      // Continue with setup if there's an error checking
    }
  };

  // Use real user ID from params or database
  const effectiveUserId = userId || realUserId;

  // Show loading while fetching user ID
  if (loadingUserId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if userId is available
  if (!effectiveUserId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.subtitle}>User ID not found. Please log in again.</Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.continueButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const homeTypes = [
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'house', label: 'House', icon: '🏠' },
    { id: 'condo', label: 'Condo', icon: '🏘️' },
    { id: 'other', label: 'Other', icon: '🏗️' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setHomeData(prev => ({ ...prev, [field]: value }));
  };

  // Function to format numbers with decimals automatically
  const formatDecimalInput = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    // Update state
    setHomeData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Function to format with decimals in real time
  const formatDecimalInputRealTime = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    // Update state without automatically adding decimals while typing
    setHomeData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Function to format integer numbers
  const formatIntegerInput = (field: string, value: string) => {
    // Only allow integer numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    setHomeData(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleHomeTypeSelect = (type: string) => {
    setHomeData(prev => ({ ...prev, homeType: type }));
  };

  const showTooltipInfo = (field: string) => {
    setShowTooltip(field);
  };

  const hideTooltip = () => {
    setShowTooltip(null);
  };

  const getTooltipMessage = (field: string) => {
    switch (field) {
      case 'area':
        return {
          title: 'Why do we need your home area?',
          message: 'Your home size helps us calculate accurate energy consumption estimates. You can find this info in rental agreements, property documents, or measure the main living spaces (length × width).'
        };
      case 'people':
        return {
          title: 'Why do we need the number of people?',
          message: 'More people typically means higher energy usage. This helps us provide personalized recommendations and compare your usage with similar households.'
        };
      default:
        return { title: '', message: '' };
    }
  };

  const handleContinue = async () => {
    // Limpiar errores previos
    setError(null);
    
    // Validaciones básicas
    if (!homeData.homeType || !homeData.squareMeters || !homeData.numberOfPeople) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const squareMeters = parseFloat(homeData.squareMeters);
    if (isNaN(squareMeters) || squareMeters <= 0) {
      Alert.alert('Error', 'Please enter a valid area in square meters');
      return;
    }

    const numberOfPeople = parseInt(homeData.numberOfPeople);
    if (isNaN(numberOfPeople) || numberOfPeople <= 0 || !Number.isInteger(numberOfPeople)) {
      Alert.alert('Error', 'Please enter a valid whole number of people');
      return;
    }

    setIsLoading(true);
    
    try {
      // Configurar la URL de la API
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'  // IP local para dispositivos físicos/emuladores
        : 'https://your-production-api-url.com'; // Cambiar por tu URL de producción

      // Use the effective user ID (from params or database)
      const user_id = effectiveUserId;
      
      console.log('HomeDataScreen - Using effective user_id:', user_id);
      console.log('HomeDataScreen - paramUserId:', userId);
      console.log('HomeDataScreen - realUserId:', realUserId);
      console.log('HomeDataScreen - effectiveUserId:', effectiveUserId);
      console.log('HomeDataScreen - user_id type:', typeof user_id);
      console.log('HomeDataScreen - user_id length:', user_id ? user_id.length : 'null');
      
      if (!user_id || user_id.trim() === '') {
        throw new Error('User ID is missing. Please try again.');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user_id.trim())) {
        console.error('HomeDataScreen - Invalid UUID format:', user_id);
        throw new Error('Invalid user ID format. Please try logging in again.');
      }
      
      const requestData = {
        user_id: user_id.trim(),
        homeType: homeData.homeType.trim(),
        squareMeters: squareMeters,
        numberOfPeople: numberOfPeople,
        location: homeData.location ? homeData.location.trim() : null
      };

      console.log('Sending household data:', requestData);
      console.log('API URL:', `${API_BASE_URL}/api/households`);

      const response = await fetch(`${API_BASE_URL}/api/households`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        console.error('Server returned error:', response.status, responseData);
        throw new Error(responseData.error || responseData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Household data saved successfully:', responseData);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Success!', 
        'Your home information has been saved successfully.',
        [{
          text: 'Continue',
          onPress: () => navigation.navigate('BaseConsumption', { userId: effectiveUserId })
        }]
      );

    } catch (error) {
      console.error('Error saving household data:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      let errorMessage = 'Failed to save your home information. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.message.includes('Internal server error')) {
          errorMessage = 'Server error. The server is having issues. Please try again in a moment.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please check if the server is running.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server internal error. Please try again later.';
        } else {
          errorMessage = `Server error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>Step 1 of 2</Text>
          </View>

          <View style={styles.logoContainer}>
            <Text style={styles.stepIcon}>🏠</Text>
            <Text style={styles.title}>Tell Us About Your Home</Text>
            <Text style={styles.subtitle}>
              This information helps us provide more accurate energy recommendations
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Home Type</Text>
            <View style={styles.homeTypeContainer}>
              {homeTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.homeTypeOption,
                    homeData.homeType === type.id && styles.homeTypeSelected
                  ]}
                  onPress={() => handleHomeTypeSelect(type.id)}
                >
                  <Text style={styles.homeTypeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.homeTypeLabel,
                    homeData.homeType === type.id && styles.homeTypeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Home Details</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>Area (square meters) </Text>
                <TouchableOpacity 
                  style={styles.tooltipButton}
                  onPress={() => showTooltipInfo('area')}
                >
                  <Text style={styles.tooltipIcon}>?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 85.5"
                value={homeData.squareMeters}
                onChangeText={(value) => formatDecimalInputRealTime('squareMeters', value)}
                onBlur={() => {
                  if (homeData.squareMeters && !homeData.squareMeters.includes('.')) {
                    setHomeData(prev => ({ 
                      ...prev, 
                      squareMeters: prev.squareMeters + '.0' 
                    }));
                  }
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>Number of people living here </Text>
                <TouchableOpacity 
                  style={styles.tooltipButton}
                  onPress={() => showTooltipInfo('people')}
                >
                  <Text style={styles.tooltipIcon}>?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                value={homeData.numberOfPeople}
                onChangeText={(value) => formatIntegerInput('numberOfPeople', value)}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="City, Country"
                value={homeData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholderTextColor="#888"
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.continueButtonText}>Saving...</Text>
              </>
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Text style={styles.continueButtonIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={hideTooltip}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showTooltip ? getTooltipMessage(showTooltip).title : ''}
            </Text>
            <Text style={styles.modalText}>
              {showTooltip ? getTooltipMessage(showTooltip).message : ''}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={hideTooltip}>
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30, // Añadir padding inferior
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  homeTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  homeTypeOption: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeTypeSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  homeTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  homeTypeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  homeTypeLabelSelected: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  continueButton: {
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
  continueButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueButtonIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Tooltip Styles
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginTop: -8, // Sube 2 puntos
  },
  tooltipIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeDataScreen;