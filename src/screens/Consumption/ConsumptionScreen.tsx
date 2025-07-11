import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ConsumptionNavigationProp } from '../../types/navigation';

const ConsumptionScreen: React.FC = () => {
  const navigation = useNavigation<ConsumptionNavigationProp>();
  const [consumptionData, setConsumptionData] = useState({
    period: 'current_month',
    electricityKwh: '',
    electricityCost: '',
    gasUsage: '',
    gasCost: '',
    waterUsage: '',
    waterCost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  });

  const periods = [
    { id: 'current_month', label: 'Current Month', icon: '📅' },
    { id: 'last_month', label: 'Last Month', icon: '📋' },
    { id: 'custom', label: 'Custom Date', icon: '🗓️' },
  ];

  // Función para formatear campos de dinero con decimales automáticamente
  const formatCurrencyInputRealTime = (field: string, value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    
    if (parts.length > 1) {
      formattedValue += '.' + parts[1].substring(0, 2);
    }
    
    setConsumptionData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Función para formatear números con decimales
  const formatNumberInputRealTime = (field: string, value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let formattedValue = parts[0];
    
    if (parts.length > 1) {
      formattedValue += '.' + parts[1];
    }
    
    setConsumptionData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePeriodSelect = (period: string) => {
    setConsumptionData(prev => ({ ...prev, period }));
  };

  const handleSaveConsumption = () => {
    // Validaciones básicas
    if (!consumptionData.electricityKwh || !consumptionData.electricityCost) {
      Alert.alert('Error', 'Please fill in at least electricity consumption and cost');
      return;
    }

    const electricityKwh = parseFloat(consumptionData.electricityKwh);
    const electricityCost = parseFloat(consumptionData.electricityCost);

    if (isNaN(electricityKwh) || electricityKwh <= 0) {
      Alert.alert('Error', 'Please enter a valid electricity consumption in kWh');
      return;
    }

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

    console.log('Consumption Data:', consumptionData);
    
    Alert.alert(
      'Consumption Saved!', 
      'Your energy consumption has been recorded successfully.',
      [
        {
          text: 'Add Another',
          style: 'cancel',
          onPress: () => {
            // Limpiar formulario para nueva entrada
            setConsumptionData({
              period: 'current_month',
              electricityKwh: '',
              electricityCost: '',
              gasUsage: '',
              gasCost: '',
              waterUsage: '',
              waterCost: '',
              notes: '',
              date: new Date().toISOString().split('T')[0],
            });
          }
        },
        { 
          text: 'Back to Dashboard', 
          onPress: () => navigation.navigate('Dashboard')
        }
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Calcular estadísticas rápidas
  const calculateQuickStats = () => {
    const kwh = parseFloat(consumptionData.electricityKwh) || 0;
    const cost = parseFloat(consumptionData.electricityCost) || 0;
    const pricePerKwh = kwh > 0 ? (cost / kwh) : 0;
    
    return {
      kwh,
      cost,
      pricePerKwh: pricePerKwh.toFixed(3),
      dailyAverage: (kwh / 30).toFixed(1), // Asumiendo 30 días por mes
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
        </View>

        {/* Electricity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Electricity (Required)</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Usage (kWh) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 350"
                value={consumptionData.electricityKwh}
                onChangeText={(value) => formatNumberInputRealTime('electricityKwh', value)}
                onBlur={() => {
                  if (consumptionData.electricityKwh && !consumptionData.electricityKwh.includes('.')) {
                    setConsumptionData(prev => ({ 
                      ...prev, 
                      electricityKwh: prev.electricityKwh + '.0' 
                    }));
                  }
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>
            
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
        </View>

        {/* Quick Stats */}
        {stats.kwh > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.pricePerKwh}</Text>
                <Text style={styles.statLabel}>per kWh</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.dailyAverage}</Text>
                <Text style={styles.statLabel}>kWh/day avg</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gas Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Gas (Optional)</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Usage (units)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 150"
                value={consumptionData.gasUsage}
                onChangeText={(value) => formatNumberInputRealTime('gasUsage', value)}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>
            
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
        </View>

        {/* Water Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💧 Water (Optional)</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Usage (gallons)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2500"
                value={consumptionData.waterUsage}
                onChangeText={(value) => formatNumberInputRealTime('waterUsage', value)}
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>
            
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConsumption}>
          <Text style={styles.saveButtonIcon}>💾</Text>
          <Text style={styles.saveButtonText}>Save Consumption</Text>
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
