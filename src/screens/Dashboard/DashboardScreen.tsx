import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { DashboardNavigationProp, RouteProp } from '../../types/navigation';
import NotificationBadge from '../../components/NotificationBadge';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import EnergyTipCarousel from '../../components/EnergyTipCarousel';
import { getTipsForCarousel, UserContext } from '../../utils/tipPersonalization';
import { EnergyTip } from '../../data/energyTips';

interface DashboardData {
  user: {
    greeting: string;
    location: string;
  };
  household: {
    type: string;
    area: number;
    occupants: number;
    location: string;
  };
  currentMonth: {
    electricity: number;
    gas: number;
    water: number;
    total: number;
    kwh: number;
    period: string;
    hasData: boolean;
  };
  savings: {
    percentage: number;
    amount: number;
    hasComparison: boolean;
    comparisonType?: string;
    baselineTotal?: number;
    baselinePeriod?: string;
  };
  goal: {
    type: string;
    target: number;
    hasRenewableEnergy: boolean;
    status?: string; // 'achieved', 'in_progress', 'behind', 'no_goal'
    targetAmount?: number;
    remainingToGoal?: number;
  };
  streak: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const route = useRoute<RouteProp<'Dashboard'>>();
  const { user, logout } = useAuth();
  const { userId } = route.params || {};
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [energyTips, setEnergyTips] = useState<EnergyTip[]>([]);
  const [realUserId, setRealUserId] = useState<string | null>(null);

  // Use userId from auth context if available, otherwise get from database
  const effectiveUserId = user?.id || userId || realUserId;

  const handleLogConsumption = () => {
    console.log('Navigate to Consumption Form');
    navigation.navigate('Consumption');
  };

  const handleProfile = () => {
    console.log('Navigate to Profile');
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, navigate to login
      navigation.navigate('Login');
    }
  };

  const handleNotifications = () => {
    if (effectiveUserId) {
      navigation.navigate('Notifications', { userId: effectiveUserId });
    }
  };

  const handleTipPress = (tip: EnergyTip) => {
    // For now we only show an alert with the complete tip
    // In the future this could navigate to a detailed tips screen
    Alert.alert(
      tip.title,
      tip.content,
      [
        { text: 'Got it!', style: 'default' },
        { text: 'Learn More', style: 'default', onPress: () => {
          // Aquí podrías navegar a más información o abrir un link
          console.log('Learn more about:', tip.title);
        }}
      ]
    );
  };

  // Function to load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Always get the latest user from database to ensure we have current data
      let currentUserId = null;
      
      console.log('DashboardScreen - Fetching latest user from database...');
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'
        : 'https://your-production-api-url.com';
        
      const userResponse = await fetch(`${API_BASE_URL}/api/energy-consumption/users/all`);
      const userData = await userResponse.json();
      
      if (userData.success && userData.data.length > 0) {
        currentUserId = userData.data[0].id;
        setRealUserId(currentUserId); // Update state for future use
        console.log('DashboardScreen - Using real user_id from database:', currentUserId);
      } else {
        throw new Error('No users found in database');
      }
      
      // Configurar la URL de la API para el dashboard
      const response = await fetch(`${API_BASE_URL}/api/energy-consumption/dashboard/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Dashboard data loaded successfully:', responseData.data);
      console.log('DashboardScreen - Current user_id used:', currentUserId);
      
      // Enhance dashboard data with goal progress if available
      const enhancedDashboardData = currentUserId 
        ? await enhanceDashboardWithGoalProgress(responseData.data, currentUserId)
        : responseData.data;
      setDashboardData(enhancedDashboardData);

      // Generar tips personalizados basados en los datos del dashboard
      if (responseData.data) {
        const userContext: UserContext = {
          goal: responseData.data.goal,
          household: responseData.data.household,
          savings: responseData.data.savings
        };
        const personalizedTips = getTipsForCarousel(userContext, 5);
        setEnergyTips(personalizedTips);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('DashboardScreen - Error details:', {
        effectiveUserId,
        realUserId,
        error: error instanceof Error ? error.message : error
      });
      
      // If there's no setup data (user skipped), show empty state
      if (error instanceof Error && (
        error.message.includes('No data found') || 
        error.message.includes('No household data found') ||
        error.message.includes('household data found')
      )) {
        setDashboardData({
          user: {
            greeting: 'Hello',
            location: 'Unknown location'
          },
          household: {
            type: 'Not set',
            area: 0,
            occupants: 0,
            location: 'Not specified'
          },
          currentMonth: {
            electricity: 0,
            gas: 0,
            water: 0,
            total: 0,
            kwh: 0,
            period: new Date().toISOString().slice(0, 7), // YYYY-MM format
            hasData: false
          },
          savings: {
            percentage: 0,
            amount: 0,
            hasComparison: false
          },
          goal: {
            type: 'Not set',
            target: 0,
            hasRenewableEnergy: false
          },
          streak: 0
        });
        
        // Generate basic tips for users without complete setup
        const basicUserContext: UserContext = {
          goal: { type: 'Not set', target: 0, hasRenewableEnergy: false },
          household: { type: 'Not set', occupants: 0 },
          savings: { percentage: 0, hasComparison: false }
        };
        const basicTips = getTipsForCarousel(basicUserContext, 3);
        setEnergyTips(basicTips);
        
        setError(null);
        return;
      }
      
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load unread notifications count
  const loadUnreadCount = async () => {
    try {
      // TODO: Temporarily disabled due to auth token issues
      // const unreadCount = await NotificationService.getUnreadCount();
      // setUnreadCount(unreadCount);
      setUnreadCount(0); // Set to 0 for now
    } catch (error) {
      console.error('Error loading unread count:', error);
      // No mostramos error para esto, es funcionalidad secundaria
    }
  };

  // Function to load goal progress data from new system
  const loadGoalProgressData = async (currentUserId: string) => {
    try {
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'
        : 'https://your-production-api-url.com';

      const response = await fetch(`${API_BASE_URL}/api/energy-consumption/goal-progress/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Goal progress data loaded:', responseData.data);
        return responseData.data;
      } else {
        console.log('Goal progress data not available, using legacy system');
        return null;
      }
    } catch (error) {
      console.log('Error loading goal progress data, falling back to legacy system:', error);
      return null;
    }
  };

  // Function to enhance dashboard data with goal progress
  const enhanceDashboardWithGoalProgress = async (baseDashboardData: DashboardData, currentUserId: string) => {
    const goalProgressData = await loadGoalProgressData(currentUserId);
    
    if (goalProgressData && goalProgressData.latest) {
      const latest = goalProgressData.latest;
      
      // Update savings data with more precise calculations
      baseDashboardData.savings = {
        ...baseDashboardData.savings,
        percentage: parseFloat(latest.savings_percentage) || baseDashboardData.savings.percentage,
        amount: parseFloat(latest.savings_amount) || baseDashboardData.savings.amount,
        hasComparison: true,
        comparisonType: 'vs_baseline'
      };

      // Add goal status information
      baseDashboardData.goal = {
        ...baseDashboardData.goal,
        status: latest.goal_status,
        targetAmount: parseFloat(latest.goal_target_amount),
        remainingToGoal: parseFloat(latest.remaining_to_goal)
      };

      console.log('Dashboard enhanced with goal progress data');
    }
    
    return baseDashboardData;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
    // loadUnreadCount(); // Temporalmente deshabilitado para evitar error 401
  }, []);

  // Reload data when screen comes into focus (e.g., after completing onboarding)
  useFocusEffect(
    useCallback(() => {
      console.log('DashboardScreen focused - reloading data');
      loadDashboardData();
    }, [])
  );

  // Prevent back navigation from Dashboard
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent hardware back button on Android from going back to onboarding
        // Show exit app confirmation instead
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit EcoSwitch?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
          ]
        );
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  // Function to get goal text
  const getGoalText = (goalType: string, target: number) => {
    switch (goalType) {
      case 'reduce_10': return '10% reduction';
      case 'reduce_20': return '20% reduction';
      case 'reduce_30': return '30% reduction';
      case 'carbon_neutral': return 'Carbon Neutral';
      default: return `${target}% reduction`;
    }
  };

  // Function to get progress text based on comparison type
  const getProgressText = (savings: any, goal: any) => {
    if (!savings.hasComparison) {
      return 'No comparison data';
    }

    const isPositive = savings.percentage >= 0;
    const percentageText = `${Math.abs(savings.percentage)}%`;
    
    if (savings.comparisonType === 'first_month') {
      // User's first month
      const targetReduction = goal.target;
      if (targetReduction > 0) {
        return `Target: ${targetReduction}% reduction`;
      }
      return 'Baseline month';
    } else if (savings.comparisonType === 'vs_baseline') {
      // Comparación con el primer mes
      if (isPositive) {
        return `${percentageText} saved!`;
      } else {
        return `${percentageText} increase`;
      }
    } else {
      // Fallback para compatibilidad
      return `${percentageText} ${isPositive ? 'saved' : 'increase'}`;
    }
  };

  // Function to get progress subtext
  const getProgressSubtext = (savings: any, goal: any) => {
    const targetText = `Target: ${getGoalText(goal.type, goal.target)}`;
    
    if (savings.comparisonType === 'first_month') {
      return `${targetText} • Track your progress next month!`;
    } else if (savings.comparisonType === 'vs_baseline' && goal.target > 0) {
      const currentProgress = Math.abs(savings.percentage);
      const targetProgress = goal.target;
      
      if (savings.percentage >= 0) {
        if (currentProgress >= targetProgress) {
          return `${targetText} • 🎉 Goal achieved!`;
        } else {
          const remaining = targetProgress - currentProgress;
          return `${targetText} • ${remaining.toFixed(1)}% more to reach your goal`;
        }
      } else {
        
        return `${targetText} • Focus on reducing consumption`;
      }
    }
    
    return targetText;
  };

  // Function to get formatted date
  const getFormattedDate = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Function to get real user from database
  const getRealUserFromDatabase = async (): Promise<string | null> => {
    try {
      const API_BASE_URL = __DEV__ 
        ? 'http://10.0.0.21:3000'
        : 'https://your-production-api-url.com';
        
      const userResponse = await fetch(`${API_BASE_URL}/api/energy-consumption/users/all`);
      const userData = await userResponse.json();
      
      if (userData.success && userData.data.length > 0) {
        const userId = userData.data[0].id;
        console.log('Found real user_id from database:', userId);
        return userId;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        // Loading State
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      ) : error ? (
        // Error State
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to load data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : !dashboardData ? (
        // No Data State
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📊</Text>
          <Text style={styles.errorTitle}>No data available</Text>
          <Text style={styles.errorMessage}>Complete your home setup to see your dashboard</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            if (effectiveUserId) {
              navigation.navigate('HomeData', { userId: effectiveUserId });
            }
          }}>
            <Text style={styles.retryButtonText}>Setup Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Dashboard Content
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                {/* <Image 
                  source={require('../../assets/images/ecoswitch_logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                /> */}
              </View>
              <View>
                <Text style={styles.greeting}>{dashboardData.user.greeting}</Text>
                <Text style={styles.username}>
                  {dashboardData.household.type === 'Not set' 
                    ? 'Complete setup to see your home info' 
                    : `${dashboardData.household.occupants}-person ${dashboardData.household.type} • ${dashboardData.household.area}m²`
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <NotificationBadge count={unreadCount} />
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
              <Text style={styles.cardDate}>{getFormattedDate(dashboardData.currentMonth.period)}</Text>
            </View>
            
            <View style={styles.totalCost}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalAmount}>
                {!dashboardData.currentMonth.hasData 
                  ? 'Complete setup' 
                  : `$${dashboardData.currentMonth.total.toFixed(2)}`
                }
              </Text>
            </View>

            <View style={styles.billsBreakdown}>
              <View style={styles.billItem}>
                <Text style={styles.billIcon}>⚡</Text>
                <View style={styles.billInfo}>
                  <Text style={styles.billType}>Electricity</Text>
                  <Text style={styles.billAmount}>
                    {!dashboardData.currentMonth.hasData 
                      ? 'No data' 
                      : `$${dashboardData.currentMonth.electricity.toFixed(2)}`
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.billItem}>
                <Text style={styles.billIcon}>🔥</Text>
                <View style={styles.billInfo}>
                  <Text style={styles.billType}>Gas</Text>
                  <Text style={styles.billAmount}>
                    {!dashboardData.currentMonth.hasData 
                      ? 'No data' 
                      : `$${dashboardData.currentMonth.gas.toFixed(2)}`
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.billItem}>
                <Text style={styles.billIcon}>💧</Text>
                <View style={styles.billInfo}>
                  <Text style={styles.billType}>Water</Text>
                  <Text style={styles.billAmount}>
                    {!dashboardData.currentMonth.hasData 
                      ? 'No data' 
                      : `$${dashboardData.currentMonth.water.toFixed(2)}`
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* Renewable Energy Badge */}
            {dashboardData.goal.hasRenewableEnergy && (
              <View style={styles.renewableBadge}>
                <Text style={styles.renewableText}>♻️ Using Renewable Energy</Text>
              </View>
            )}
          </LinearGradient>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Goal Progress</Text>
              <Text style={styles.progressPercentage}>
                {dashboardData.goal.type === 'Not set' 
                  ? 'No goal set' 
                  : getProgressText(dashboardData.savings, dashboardData.goal)
                }
              </Text>
            </View>
            
            {/* Show journey message for first month */}
            {dashboardData.savings.comparisonType === 'first_month' && dashboardData.goal.target > 0 && (
              <Text style={styles.journeyMessage}>
                🌱 Starting your energy-saving journey!
              </Text>
            )}
            
            {dashboardData.goal.type === 'Not set' ? (
              <View style={styles.setupPrompt}>
                <Text style={styles.setupPromptIcon}>🎯</Text>
                <Text style={styles.setupPromptTitle}>Set Your Energy Goal</Text>
                <Text style={styles.setupPromptText}>
                  Complete your setup to set energy saving goals and track your progress
                </Text>
                <TouchableOpacity 
                  style={styles.setupPromptButton} 
                  onPress={() => {
                    if (effectiveUserId) {
                      navigation.navigate('HomeData', { userId: effectiveUserId });
                    }
                  }}
                >
                  <Text style={styles.setupPromptButtonText}>Complete Setup</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {dashboardData.savings.hasComparison && dashboardData.savings.comparisonType !== 'first_month' && (
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(Math.abs(dashboardData.savings.percentage), 100)}%`,
                        backgroundColor: dashboardData.savings.percentage >= 0 ? '#4CAF50' : '#F44336'
                      }
                    ]} />
                  </View>
                )}
                {dashboardData.savings.comparisonType === 'first_month' && dashboardData.goal.target > 0 && (
                  <View style={styles.goalVisualization}>
                    <Text style={styles.goalVisualizationText}>
                      Your baseline: ${dashboardData.currentMonth.total.toFixed(2)}
                    </Text>
                    <Text style={styles.goalVisualizationText}>
                      Goal target: ${(dashboardData.currentMonth.total * (1 - dashboardData.goal.target / 100)).toFixed(2)}
                    </Text>
                    <View style={styles.goalProgressBar}>
                      <View style={[styles.goalProgressFill, { width: '0%' }]} />
                    </View>
                    <Text style={styles.goalHelpText}>🌱 Start tracking your progress next month!</Text>
                  </View>
                )}
                
                {/* Enhanced progress visualization for users with consumption updates */}
                {dashboardData.savings.comparisonType === 'vs_baseline' && (
                  <View style={styles.enhancedGoalVisualization}>
                    <View style={styles.progressMetrics}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Current</Text>
                        <Text style={styles.metricValue}>${dashboardData.currentMonth.total.toFixed(2)}</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Baseline</Text>
                        <Text style={styles.metricValue}>${(dashboardData.savings.baselineTotal || 0).toFixed(2)}</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Target</Text>
                        <Text style={styles.metricValue}>
                          ${((dashboardData.savings.baselineTotal || 0) * (1 - dashboardData.goal.target / 100)).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarTrack}>
                        {/* Baseline to current progress */}
                        <View style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(Math.abs(dashboardData.savings.percentage), 100)}%`,
                            backgroundColor: dashboardData.savings.percentage >= 0 ? '#4CAF50' : '#F44336'
                          }
                        ]} />
                        {/* Goal target indicator */}
                        <View style={[
                          styles.goalTargetIndicator,
                          { left: `${Math.min(dashboardData.goal.target, 100)}%` }
                        ]} />
                      </View>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelStart}>Baseline</Text>
                        <Text style={[
                          styles.progressLabelCurrent,
                          { 
                            left: `${Math.min(Math.abs(dashboardData.savings.percentage), 95)}%`,
                            color: dashboardData.savings.percentage >= 0 ? '#4CAF50' : '#F44336'
                          }
                        ]}>
                          {dashboardData.savings.percentage >= 0 ? '+' : ''}{dashboardData.savings.percentage}%
                        </Text>
                        <Text style={styles.progressLabelEnd}>Goal: {dashboardData.goal.target}%</Text>
                      </View>
                    </View>
                    
                    {/* Goal status message */}
                    <View style={styles.goalStatusContainer}>
                      {dashboardData.goal.status === 'achieved' ? (
                        <Text style={styles.goalAchievedText}>
                          🎉 Congratulations! You've achieved your {dashboardData.goal.target}% reduction goal!
                        </Text>
                      ) : dashboardData.goal.status === 'in_progress' ? (
                        <Text style={styles.goalInProgressText}>
                          💪 Great progress! {(dashboardData.goal.target - Math.abs(dashboardData.savings.percentage)).toFixed(1)}% more to reach your goal
                          {dashboardData.goal.remainingToGoal && dashboardData.goal.remainingToGoal > 0 && 
                            ` (save $${dashboardData.goal.remainingToGoal.toFixed(2)} more)`
                          }
                        </Text>
                      ) : dashboardData.goal.status === 'behind' ? (
                        <Text style={styles.goalBehindText}>
                          📈 Focus on reducing consumption to get back on track
                          {dashboardData.goal.targetAmount && 
                            ` (target: $${dashboardData.goal.targetAmount.toFixed(2)})`
                          }
                        </Text>
                      ) : dashboardData.savings.percentage >= dashboardData.goal.target ? (
                        <Text style={styles.goalAchievedText}>
                          🎉 Congratulations! You've achieved your goal!
                        </Text>
                      ) : dashboardData.savings.percentage > 0 ? (
                        <Text style={styles.goalInProgressText}>
                          💪 Great progress! {(dashboardData.goal.target - dashboardData.savings.percentage).toFixed(1)}% more to reach your goal
                        </Text>
                      ) : (
                        <Text style={styles.goalBehindText}>
                          📈 Focus on reducing consumption to get back on track
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                <Text style={styles.progressSubtext}>
                  {getProgressSubtext(dashboardData.savings, dashboardData.goal)}
                  {dashboardData.streak > 0 && ` • ${dashboardData.streak} day streak! 🔥`}
                </Text>
              </>
            )}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleLogConsumption}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Log Consumption</Text>
              <Text style={styles.actionSubtitle}>Track your usage</Text>
            </TouchableOpacity>
          </View>

          {/* Energy Tips Carousel */}
          <EnergyTipCarousel 
            tips={energyTips} 
            onTipPress={handleTipPress}
            autoRotateInterval={10000}
          />

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
      )}
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
  badgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'left',
  },
  journeyMessage: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
    paddingHorizontal: 8,
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
    width: '100%',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  
  // Error States
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Renewable Energy Badge
  renewableBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  renewableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Goal Visualization Styles
  goalVisualization: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
  goalVisualizationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginVertical: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  goalHelpText: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Setup Prompt Styles
  setupPrompt: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  setupPromptIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  setupPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  setupPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  setupPromptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  setupPromptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  // Enhanced Goal Progress Styles
  enhancedGoalVisualization: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  goalTargetIndicator: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: '#FF9800',
    borderRadius: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  progressLabelStart: {
    fontSize: 10,
    color: '#666',
    position: 'absolute',
    left: 0,
  },
  progressLabelCurrent: {
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    transform: [{ translateX: -10 }],
  },
  progressLabelEnd: {
    fontSize: 10,
    color: '#FF9800',
    position: 'absolute',
    right: 0,
    fontWeight: '600',
  },
  goalStatusContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  goalAchievedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  goalInProgressText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    textAlign: 'center',
  },
  goalBehindText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DashboardScreen;