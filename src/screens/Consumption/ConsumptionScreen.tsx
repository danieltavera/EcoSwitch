import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ConsumptionNavigationProp } from '../../types/navigation';

const ConsumptionScreen: React.FC = () => {
  const navigation = useNavigation<ConsumptionNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [consumptionData, setConsumptionData] = useState({
    period: 'current',
    electricityCost: '',
    gasCost: '',
    waterCost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  });

  const periods = [
    { id: 'current', label: 'Current Date', icon: '�' },
    { id: 'custom', label: 'Select Date', icon: '🗓️' },
  ];

  // Function to format money fields with decimals automatically
  const formatCurrencyInputRealTime = (field: string, value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    
    if (parts.length > 1) {
      formattedValue += '.' + parts[1].substring(0, 2);
    }
    
    setConsumptionData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePeriodSelect = (period: string) => {
    if (period === 'current') {
      // Auto-set to current date
      setConsumptionData(prev => ({ 
        ...prev, 
        period, 
        date: new Date().toISOString().split('T')[0] 
      }));
    } else {
      // Keep existing date for custom selection
      setConsumptionData(prev => ({ ...prev, period }));
    }
  };

  const handleSaveConsumption = async () => {
    // Validaciones básicas
    if (!consumptionData.electricityCost) {
      Alert.alert('Error', 'Please fill in electricity cost');
      return;
    }

    const electricityCost = parseFloat(consumptionData.electricityCost);

    if (isNaN(electricityCost) || electricityCost <= 0) {
      Alert.alert('Error', 'Please enter a valid electricity cost');
      return;
    }

    // Validar campos opcionales si están llenos
    if (consumptionData.gasCost && consumptionData.gasCost !== '') {
      const gasCost = parseFloat(consumptionData.gasCost);
      if (isNaN(gasCost) || gasCost < 0) {
        Alert.alert('Error', 'Please enter a valid gas cost');
        return;
      }
    }

    if (consumptionData.waterCost && consumptionData.waterCost !== '') {
      const waterCost = parseFloat(consumptionData.waterCost);
      if (isNaN(waterCost) || waterCost < 0) {
        Alert.alert('Error', 'Please enter a valid water cost');
        return;
      }
    }

    setIsLoading(true);

    try {
      // TODO: En una implementación real, obtener el user_id del contexto de autenticación
      const user_id = 'eb5aab3b-508f-40ac-a1e5-0490f9b1aca0';

      // Determinar el período personalizado según la selección
      let customPeriod = undefined;
      if (consumptionData.period === 'custom' && consumptionData.date) {
        // Para fechas personalizadas, usar la fecha exacta seleccionada
        customPeriod = consumptionData.date;
      } else if (consumptionData.period === 'current') {
        // Para fecha actual, usar la fecha de hoy
        customPeriod = new Date().toISOString().split('T')[0];
      }

      // Preparar datos para la API (usando la misma estructura que el onboarding)
      const requestData = {
        user_id,
        monthlyElectricBill: consumptionData.electricityCost,
        monthlyGasBill: consumptionData.gasCost || null,
        monthlyWaterBill: consumptionData.waterCost || null,
        hasRenewableEnergy: false, // Could add this option to the form later
        energyGoal: 'reduce_20', // Default value, could be obtained from user profile
        customPeriod: customPeriod
      };

      console.log('Sending consumption data to API:', requestData);

      // Configurar la URL de la API
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'  // IP local para dispositivos físicos/emuladores
        : 'https://your-production-api-url.com'; // Cambiar por tu URL de producción

      const response = await fetch(`${API_BASE_URL}/api/energy-consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Consumption data saved successfully:', responseData);

      // Mostrar mensaje de éxito
      Alert.alert(
        'Success!', 
        'Your energy consumption has been saved successfully.',
        [
          {
            text: 'Add Another',
            style: 'cancel',
            onPress: () => {
              // Limpiar formulario para nueva entrada
              setConsumptionData({
                period: 'current',
                electricityCost: '',
                gasCost: '',
                waterCost: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              });
            }
          },
          { 
            text: 'Back to Dashboard', 
            onPress: () => navigation.navigate('Dashboard', { userId: undefined })
          }
        ]
      );

    } catch (error) {
      console.error('Error saving consumption data:', error);
      
      let errorMessage = 'Failed to save your consumption data. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.message.includes('already exists')) {
          errorMessage = 'Consumption data for this period already exists. Try updating it instead.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Calcular estadísticas rápidas
  const calculateQuickStats = () => {
    const electricityCost = parseFloat(consumptionData.electricityCost) || 0;
    const gasCost = parseFloat(consumptionData.gasCost) || 0;
    const waterCost = parseFloat(consumptionData.waterCost) || 0;
    const totalCost = electricityCost + gasCost + waterCost;
    
    return {
      electricityCost,
      totalCost,
      dailyAverage: (electricityCost / 30).toFixed(2), // Asumiendo 30 días por mes
    };
  };

  const stats = calculateQuickStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Consumption</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainIcon}>📊</Text>
          <Text style={styles.title}>Track Your Usage</Text>
          <Text style={styles.subtitle}>
            Log your energy consumption to track progress and get personalized insights
          </Text>
        </View>

        {/* Period Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period</Text>
          <View style={styles.periodContainer}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodOption,
                  consumptionData.period === period.id && styles.periodSelected
                ]}
                onPress={() => handlePeriodSelect(period.id)}
              >
                <Text style={styles.periodIcon}>{period.icon}</Text>
                <Text style={[
                  styles.periodLabel,
                  consumptionData.period === period.id && styles.periodLabelSelected
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Show selected date for current period */}
          {consumptionData.period === 'current' && (
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                📅 Selected Date: {new Date(consumptionData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}
          
          {/* Custom Date Input */}
          {consumptionData.period === 'custom' && (
            <View style={styles.customDateContainer}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g., 2025-08-20)"
                value={consumptionData.date}
                onChangeText={(value) => {
                  // Validate date format and ensure it's not in the past
                  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                  if (dateRegex.test(value) || value.length <= 10) {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time for comparison
                    
                    // Only allow current date or future dates
                    if (selectedDate >= today || value.length <= 10) {
                      setConsumptionData(prev => ({ ...prev, date: value }));
                    }
                  }
                }}
                placeholderTextColor="#888"
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.helpText}>
                Enter a date from today onwards (YYYY-MM-DD format)
              </Text>
            </View>
          )}
        </View>

        {/* Electricity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Electricity (Required)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 125.50"
              value={consumptionData.electricityCost}
              onChangeText={(value) => formatCurrencyInputRealTime('electricityCost', value)}
              onBlur={() => {
                if (consumptionData.electricityCost && !consumptionData.electricityCost.includes('.')) {
                  setConsumptionData(prev => ({ 
                    ...prev, 
                    electricityCost: prev.electricityCost + '.00' 
                  }));
                }
              }}
              keyboardType="decimal-pad"
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Quick Stats */}
        {stats.electricityCost > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.totalCost.toFixed(2)}</Text>
                <Text style={styles.statLabel}>total cost</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.dailyAverage}</Text>
                <Text style={styles.statLabel}>daily avg</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gas Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Gas (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 80.25"
              value={consumptionData.gasCost}
              onChangeText={(value) => formatCurrencyInputRealTime('gasCost', value)}
              onBlur={() => {
                if (consumptionData.gasCost && !consumptionData.gasCost.includes('.')) {
                  setConsumptionData(prev => ({ 
                    ...prev, 
                    gasCost: prev.gasCost + '.00' 
                  }));
                }
              }}
              keyboardType="decimal-pad"
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Water Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💧 Water (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cost ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45.75"
              value={consumptionData.waterCost}
              onChangeText={(value) => formatCurrencyInputRealTime('waterCost', value)}
              onBlur={() => {
                if (consumptionData.waterCost && !consumptionData.waterCost.includes('.')) {
                  setConsumptionData(prev => ({ 
                    ...prev, 
                    waterCost: prev.waterCost + '.00' 
                  }));
                }
              }}
              keyboardType="decimal-pad"
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any notes about this period's consumption..."
            value={consumptionData.notes}
            onChangeText={(value) => setConsumptionData(prev => ({ ...prev, notes: value }))}
            multiline
            numberOfLines={3}
            placeholderTextColor="#888"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSaveConsumption}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 12 }} />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </>
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Save Consumption</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 50,
  },
  
  // Title Section
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  mainIcon: {
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
  
  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  
  // Period Selection
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  periodSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  periodIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  periodLabelSelected: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  
  // Custom Date
  customDateContainer: {
    marginTop: 16,
  },
  selectedDateContainer: {
    marginTop: 16,
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Input Styles
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0.1,
  },
  saveButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConsumptionScreen;