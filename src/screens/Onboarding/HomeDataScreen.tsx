import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeDataNavigationProp } from '../../types/navigation';

const HomeDataScreen: React.FC = () => {
  const navigation = useNavigation<HomeDataNavigationProp>();
  const [homeData, setHomeData] = useState({
    homeType: '',
    squareMeters: '',
    numberOfPeople: '',
    location: '',
  });

  const homeTypes = [
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'house', label: 'House', icon: '🏠' },
    { id: 'condo', label: 'Condo', icon: '🏘️' },
    { id: 'other', label: 'Other', icon: '🏗️' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setHomeData(prev => ({ ...prev, [field]: value }));
  };

  // Función para formatear números con decimales automáticamente
  const formatDecimalInput = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    // Actualizar el estado
    setHomeData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Función para formatear con decimales en tiempo real
  const formatDecimalInputRealTime = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    // Actualizar el estado sin añadir decimales automáticamente mientras escribe
    setHomeData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Función para formatear números enteros
  const formatIntegerInput = (field: string, value: string) => {
    // Solo permitir números enteros
    const cleanValue = value.replace(/[^0-9]/g, '');
    setHomeData(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleHomeTypeSelect = (type: string) => {
    setHomeData(prev => ({ ...prev, homeType: type }));
  };

  const handleContinue = () => {
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

    console.log('Home Data:', homeData);
    navigation.navigate('BaseConsumption');
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
              <Text style={styles.inputLabel}>Area (square meters) *</Text>
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
              <Text style={styles.inputLabel}>Number of people living here *</Text>
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
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Text style={styles.continueButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
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
});

export default HomeDataScreen;
