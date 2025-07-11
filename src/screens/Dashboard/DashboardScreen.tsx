import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DashboardNavigationProp } from '../../types/navigation';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();

  // Datos de ejemplo para el usuario
  const userStats = {
    currentMonth: {
      electricity: 125.50,
      gas: 68.25,
      water: 42.80,
      total: 236.55
    },
    savings: 15.2, // porcentaje de ahorro
    goal: 'reduce_20', // meta del usuario
    streak: 12 // días consecutivos
  };

  const handleLogConsumption = () => {
    console.log('Navigate to Consumption Form');
    navigation.navigate('Consumption');
  };

  const handleViewChallenges = () => {
    console.log('Navigate to Challenges');
    // TODO: navigation.navigate('Challenges');
  };

  const handleEducationCenter = () => {
    console.log('Navigate to Education');
    // TODO: navigation.navigate('Education');
  };

  const handleCommunity = () => {
    console.log('Navigate to Community');
    // TODO: navigation.navigate('Community');
  };

  const handleProfile = () => {
    console.log('Navigate to Profile');
    // TODO: navigation.navigate('Profile');
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/ecoswitch_logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.greeting}>Good morning! 🌅</Text>
              <Text style={styles.username}>Welcome back</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Current Month Overview */}
        <LinearGradient
          colors={['#2E7D32', '#43A047', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This Month</Text>
            <Text style={styles.cardDate}>December 2024</Text>
          </View>
          
          <View style={styles.totalCost}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalAmount}>${userStats.currentMonth.total}</Text>
          </View>

          <View style={styles.billsBreakdown}>
            <View style={styles.billItem}>
              <Text style={styles.billIcon}>⚡</Text>
              <View style={styles.billInfo}>
                <Text style={styles.billType}>Electricity</Text>
                <Text style={styles.billAmount}>${userStats.currentMonth.electricity}</Text>
              </View>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billIcon}>🔥</Text>
              <View style={styles.billInfo}>
                <Text style={styles.billType}>Gas</Text>
                <Text style={styles.billAmount}>${userStats.currentMonth.gas}</Text>
              </View>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billIcon}>💧</Text>
              <View style={styles.billInfo}>
                <Text style={styles.billType}>Water</Text>
                <Text style={styles.billAmount}>${userStats.currentMonth.water}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Goal Progress</Text>
            <Text style={styles.progressPercentage}>{userStats.savings}% saved</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userStats.savings}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>Target: 20% reduction • {userStats.streak} day streak! 🔥</Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleLogConsumption}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Log Consumption</Text>
            <Text style={styles.actionSubtitle}>Track your usage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewChallenges}>
            <Text style={styles.actionIcon}>🎮</Text>
            <Text style={styles.actionTitle}>Challenges</Text>
            <Text style={styles.actionSubtitle}>Earn rewards</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleEducationCenter}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionTitle}>Learn</Text>
            <Text style={styles.actionSubtitle}>Energy tips</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleCommunity}>
            <Text style={styles.actionIcon}>🌍</Text>
            <Text style={styles.actionTitle}>Community</Text>
            <Text style={styles.actionSubtitle}>Connect & share</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🎯</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Challenge Completed!</Text>
              <Text style={styles.activitySubtitle}>Reduce standby power • +50 points</Text>
            </View>
            <Text style={styles.activityTime}>2h ago</Text>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Consumption Logged</Text>
              <Text style={styles.activitySubtitle}>December electricity bill added</Text>
            </View>
            <Text style={styles.activityTime}>1d ago</Text>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🎓</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Lesson Completed</Text>
              <Text style={styles.activitySubtitle}>Solar Energy Basics • +25 points</Text>
            </View>
            <Text style={styles.activityTime}>3d ago</Text>
          </View>
        </View>

        {/* Profile Access */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Text style={styles.profileIcon}>👤</Text>
            <Text style={styles.profileText}>My Profile & Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    fontSize: 20,
  },
  
  // Overview Card
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDate: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  totalCost: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  billsBreakdown: {
    gap: 12,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billType: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F5E8',
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Activity Card
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  
  // Bottom Actions
  bottomActions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  profileButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default DashboardScreen;
