import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseConsumptionNavigationProp } from '../../types/navigation';

const BaseConsumptionScreen: React.FC = () => {
  const navigation = useNavigation<BaseConsumptionNavigationProp>();
  const [consumptionData, setConsumptionData] = useState({
    monthlyElectricBill: '',
    monthlyGasBill: '',
    monthlyWaterBill: '',
    hasRenewableEnergy: false,
    energyGoal: '',
  });

  const energyGoals = [
    { id: 'reduce_10', label: 'Reduce 10%', icon: '🎯' },
    { id: 'reduce_20', label: 'Reduce 20%', icon: '🌱' },
    { id: 'reduce_30', label: 'Reduce 30%', icon: '🌿' },
    { id: 'carbon_neutral', label: 'Carbon Neutral', icon: '♻️' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setConsumptionData(prev => ({ ...prev, [field]: value }));
  };

  // Función para formatear campos de dinero con decimales automáticamente
  const formatCurrencyInput = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    
    if (parts.length > 1) {
      // Limitar a 2 decimales para moneda
      formattedValue += '.' + parts[1].substring(0, 2);
    } else if (cleanValue.length > 0 && !cleanValue.includes('.')) {
      // Si es un número entero y tiene contenido, añadir .00
      formattedValue += '.00';
    }
    
    // Actualizar el estado
    setConsumptionData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Función para formatear con decimales mientras el usuario escribe
  const formatCurrencyInputRealTime = (field: string, value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    
    if (parts.length > 1) {
      // Limitar a 2 decimales para moneda
      formattedValue += '.' + parts[1].substring(0, 2);
    }
    
    // Actualizar el estado sin añadir .00 automáticamente mientras escribe
    setConsumptionData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleGoalSelect = (goal: string) => {
    setConsumptionData(prev => ({ ...prev, energyGoal: goal }));
  };

  const toggleRenewableEnergy = () => {
    setConsumptionData(prev => ({ ...prev, hasRenewableEnergy: !prev.hasRenewableEnergy }));
  };

  const handleFinishSetup = () => {
    // Validaciones básicas
    if (!consumptionData.monthlyElectricBill || !consumptionData.energyGoal) {
      Alert.alert('Error', 'Please fill in the electric bill amount and select an energy goal');
      return;
    }

    const electricBill = parseFloat(consumptionData.monthlyElectricBill);
    if (isNaN(electricBill) || electricBill <= 0) {
      Alert.alert('Error', 'Please enter a valid electric bill amount');
      return;
    }

    // Validar campos opcionales si están llenos
    if (consumptionData.monthlyGasBill) {
      const gasBill = parseFloat(consumptionData.monthlyGasBill);
      if (isNaN(gasBill) || gasBill < 0) {
        Alert.alert('Error', 'Please enter a valid gas bill amount');
        return;
      }
    }

    if (consumptionData.monthlyWaterBill) {
      const waterBill = parseFloat(consumptionData.monthlyWaterBill);
      if (isNaN(waterBill) || waterBill < 0) {
        Alert.alert('Error', 'Please enter a valid water bill amount');
        return;
      }
    }

    console.log('Consumption Data:', consumptionData);
    Alert.alert(
      'Setup Complete!', 
      'Welcome to EcoSwitch! Your profile has been created successfully.',
      [{ 
        text: 'Get Started', 
        onPress: () => {
          console.log('Navigate to Dashboard');
          // Aquí navegaremos al dashboard cuando lo creemos
          // navigation.navigate('Dashboard' as never);
          // Por ahora volvemos al login para demostrar el flujo
          navigation.navigate('Login' as never);
        }
      }]
    );
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
            <Text style={styles.stepIndicator}>Step 2 of 2</Text>
          </View>

          <View style={styles.logoContainer}>
            <Text style={styles.stepIcon}>⚡</Text>
            <Text style={styles.title}>Energy Baseline</Text>
            <Text style={styles.subtitle}>
              Help us understand your current energy usage to provide better recommendations
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Monthly Bills (Optional)</Text>
            <Text style={styles.sectionSubtitle}>Enter your average monthly costs</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Electricity Bill ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 120.50"
                value={consumptionData.monthlyElectricBill}
                onChangeText={(value) => formatCurrencyInputRealTime('monthlyElectricBill', value)}
                onBlur={() => {
                  if (consumptionData.monthlyElectricBill && !consumptionData.monthlyElectricBill.includes('.')) {
                    setConsumptionData(prev => ({ 
                      ...prev, 
                      monthlyElectricBill: prev.monthlyElectricBill + '.00' 
                    }));
                  }
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gas Bill ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 80.25"
                value={consumptionData.monthlyGasBill}
                onChangeText={(value) => formatCurrencyInputRealTime('monthlyGasBill', value)}
                onBlur={() => {
                  if (consumptionData.monthlyGasBill && !consumptionData.monthlyGasBill.includes('.')) {
                    setConsumptionData(prev => ({ 
                      ...prev, 
                      monthlyGasBill: prev.monthlyGasBill + '.00' 
                    }));
                  }
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Water Bill ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 45.75"
                value={consumptionData.monthlyWaterBill}
                onChangeText={(value) => formatCurrencyInputRealTime('monthlyWaterBill', value)}
                onBlur={() => {
                  if (consumptionData.monthlyWaterBill && !consumptionData.monthlyWaterBill.includes('.')) {
                    setConsumptionData(prev => ({ 
                      ...prev, 
                      monthlyWaterBill: prev.monthlyWaterBill + '.00' 
                    }));
                  }
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>

            <TouchableOpacity style={styles.renewableToggle} onPress={toggleRenewableEnergy}>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>I use renewable energy sources</Text>
                <View style={[styles.toggle, consumptionData.hasRenewableEnergy && styles.toggleActive]}>
                  <View style={[styles.toggleCircle, consumptionData.hasRenewableEnergy && styles.toggleCircleActive]} />
                </View>
              </View>
              <Text style={styles.toggleSubtext}>Solar panels, wind energy, etc.</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Your Energy Goal</Text>
            <Text style={styles.sectionSubtitle}>What would you like to achieve?</Text>
            
            <View style={styles.goalsContainer}>
              {energyGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    consumptionData.energyGoal === goal.id && styles.goalSelected
                  ]}
                  onPress={() => handleGoalSelect(goal.id)}
                >
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text style={[
                    styles.goalLabel,
                    consumptionData.energyGoal === goal.id && styles.goalLabelSelected
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.finishButton} onPress={handleFinishSetup}>
            <Text style={styles.finishButtonIcon}>🎉</Text>
            <Text style={styles.finishButtonText}>Complete Setup</Text>
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
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  renewableToggle: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  toggleSubtext: {
    fontSize: 14,
    color: '#666',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalOption: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  goalSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  goalIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  finishButton: {
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
  finishButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BaseConsumptionScreen;
