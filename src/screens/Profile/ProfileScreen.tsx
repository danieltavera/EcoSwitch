import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ProfileNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

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
    status?: string;
    targetAmount?: number;
    remainingToGoal?: number;
  };
  streak: number;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, logout, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [progressAnims] = useState({
    progress: new Animated.Value(0),
    reduction: new Animated.Value(0),
    achievement: new Animated.Value(0),
  });

  // Componente para gráfica circular animada
  const CircularProgress = ({ 
    percentage, 
    size = 80, 
    strokeWidth = 8, 
    color = '#FF9800', 
    title, 
    animValue 
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    title: string;
    animValue: Animated.Value;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage / 100);
    
    return (
      <View style={styles.circularContainer}>
        <Animated.View style={{ opacity: animValue }}>
          <Svg width={size} height={size} style={styles.circularSvg}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View style={[styles.circularTextContainer, { width: size, height: size }]}>
            <Text style={styles.circularPercentage}>{Math.round(percentage)}%</Text>
            <Text style={styles.circularTitle}>{title}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Componente para barra de progreso ondulada
  const WaveProgressBar = ({ 
    percentage, 
    color = '#FF9800', 
    title, 
    animValue 
  }: {
    percentage: number;
    color?: string;
    title: string;
    animValue: Animated.Value;
  }) => {
    return (
      <View style={styles.waveContainer}>
        <Text style={styles.waveTitle}>{title}</Text>
        <View style={styles.waveProgressContainer}>
          <Animated.View 
            style={[
              styles.waveProgress,
              { 
                width: `${percentage}%`,
                opacity: animValue,
                transform: [{ 
                  scaleX: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.waveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          <Text style={styles.wavePercentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  // Componente para gráfica de medidor (gauge)
  const GaugeChart = ({ 
    percentage, 
    title, 
    animValue 
  }: {
    percentage: number;
    title: string;
    animValue: Animated.Value;
  }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI; // Solo semicírculo
    
    return (
      <View style={styles.gaugeContainer}>
        <Animated.View style={{ opacity: animValue }}>
          <Svg width={size} height={size / 2 + 20} style={styles.gaugeSvg}>
            {/* Background arc */}
            <Path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <Path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${strokeWidth / 2 + (size - strokeWidth) * percentage / 100} ${size / 2}`}
              stroke="#FF9800"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.gaugeTextContainer}>
            <Text style={styles.gaugePercentage}>{Math.round(percentage)}%</Text>
            <Text style={styles.gaugeTitle}>{title}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Function to save profile image to AsyncStorage
  const saveProfileImage = async (imageUri: string) => {
    try {
      if (!user?.id) return;
      
      const storageKey = `profile_image_${user.id}`;
      await AsyncStorage.setItem(storageKey, imageUri);
      console.log('Profile image saved successfully');
      
      // Optional: Upload to backend
      // await uploadImageToBackend(imageUri);
      
    } catch (error) {
      console.error('Error saving profile image:', error);
      Alert.alert('Error', 'Failed to save profile image');
    }
  };

  // Function to load profile image from AsyncStorage
  const loadProfileImage = async () => {
    try {
      if (!user?.id) return;
      
      const storageKey = `profile_image_${user.id}`;
      const savedImage = await AsyncStorage.getItem(storageKey);
      
      if (savedImage) {
        setProfileImage(savedImage);
        console.log('Profile image loaded successfully');
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  // Optional: Function to upload image to backend
  const uploadImageToBackend = async (imageUri: string) => {
    try {
      if (!user?.id || !token) {
        console.log('Profile - Cannot upload image: missing user ID or token');
        return;
      }
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${user.id}.jpg`,
      } as any);
      
      console.log('Profile - Uploading image for user:', user.id);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image to server');
      }

      const responseData = await response.json();
      console.log('Profile - Image uploaded successfully for user:', user.id, responseData);
    } catch (error) {
      console.error('Profile - Error uploading image to backend for user:', user?.id, error);
      // Don't show error to user, since local storage worked
    }
  };

  // Function to load dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) {
      console.log('Profile - No authenticated user found');
      return;
    }
    
    console.log('Profile - Loading dashboard data for user:', user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_BASE_URL}/api/energy-consumption/dashboard/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Profile - Dashboard data loaded for user:', user.id, responseData.data);
      
      // Validate that the data belongs to the authenticated user
      if (responseData.data && responseData.data.user) {
        console.log('Profile - Data validation: User data received');
        setDashboardData(responseData.data);
      } else {
        console.warn('Profile - No user-specific data received, using defaults');
        // Set realistic default data for the authenticated user
        setDashboardData({
          user: { 
            greeting: `Hello ${user.firstName}`, 
            location: 'Set your location in settings' 
          },
          household: { 
            type: 'Please complete setup', 
            area: 0, 
            occupants: 1, 
            location: 'Not specified' 
          },
          currentMonth: { 
            electricity: 0, 
            gas: 0, 
            water: 0, 
            total: 0, 
            kwh: 0, 
            period: new Date().toISOString().slice(0, 7), 
            hasData: false 
          },
          savings: { 
            percentage: 0, 
            amount: 0, 
            hasComparison: false 
          },
          goal: { 
            type: 'Not set', 
            target: 20, // Default 20% reduction goal
            hasRenewableEnergy: false 
          },
          streak: 0
        });
      }

    } catch (error) {
      console.error('Profile - Error loading dashboard data for user:', user.id, error);
      setError(`Unable to load profile data for ${user.firstName}. Please check your connection.`);
      
      // Set user-specific default data even on error
      setDashboardData({
        user: { 
          greeting: `Hello ${user.firstName}`, 
          location: 'Unable to load location' 
        },
        household: { 
          type: 'Setup required', 
          area: 0, 
          occupants: 1, 
          location: 'Unknown' 
        },
        currentMonth: { 
          electricity: 0, 
          gas: 0, 
          water: 0, 
          total: 0, 
          kwh: 0, 
          period: new Date().toISOString().slice(0, 7), 
          hasData: false 
        },
        savings: { 
          percentage: 0, 
          amount: 0, 
          hasComparison: false 
        },
        goal: { 
          type: 'reduce_20', 
          target: 20, 
          hasRenewableEnergy: false 
        },
        streak: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle profile image selection
  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose how you want to set your profile photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        ...(profileImage ? [{ text: 'Remove Photo', onPress: removeProfileImage, style: 'destructive' as const }] : []),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Function to remove profile image
  const removeProfileImage = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) return;
              
              const storageKey = `profile_image_${user.id}`;
              await AsyncStorage.removeItem(storageKey);
              setProfileImage(null);
              console.log('Profile image removed successfully');
            } catch (error) {
              console.error('Error removing profile image:', error);
              Alert.alert('Error', 'Failed to remove profile image');
            }
          }
        }
      ]
    );
  };

  // Function to take photo with camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission needed', 'Please allow camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await saveProfileImage(imageUri);
    }
  };

  // Function to pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission needed', 'Please allow gallery access to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await saveProfileImage(imageUri);
    }
  };

  // Animation for card press
  const handleCardPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Function to handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.navigate('Login');
            }
          }
        }
      ]
    );
  };

  // Function to get goal text
  const getGoalText = (goalType: string, target: number) => {
    switch (goalType) {
      case 'reduce_10': return '10% reduction';
      case 'reduce_20': return '20% reduction';
      case 'reduce_30': return '30% reduction';
      case 'carbon_neutral': return 'Carbon Neutral';
      default: return target > 0 ? `${target}% reduction` : 'No goal set';
    }
  };

  // Function to get progress percentage
  const getProgressPercentage = () => {
    if (!dashboardData?.savings || !dashboardData?.goal?.target) {
      console.log('Profile - No progress data available for user:', user?.id);
      return 0;
    }
    const progressPercent = Math.min((dashboardData.savings.percentage / dashboardData.goal.target) * 100, 100);
    console.log('Profile - Progress calculation for user:', user?.id, {
      savingsPercentage: dashboardData.savings.percentage,
      goalTarget: dashboardData.goal.target,
      calculatedProgress: progressPercent
    });
    return Math.round(progressPercent);
  };

  // Animate progress charts when data loads
  const animateCharts = () => {
    // Reset animations
    progressAnims.progress.setValue(0);
    progressAnims.reduction.setValue(0);
    progressAnims.achievement.setValue(0);

    // Start animations with delays
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(progressAnims.progress, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnims.reduction, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnims.achievement, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadProfileImage();
  }, [user?.id]);

  // Animate charts when data is loaded
  useEffect(() => {
    if (dashboardData && !isLoading) {
      animateCharts();
    }
  }, [dashboardData, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view your profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Single Profile Card with animated relief effect */}
        <Animated.View
          style={[
            styles.animatedCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#2E7D32', '#43A047', '#66BB6A']}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Profile Photo Section */}
            <TouchableOpacity 
              style={styles.profilePhotoContainer}
              onPress={handleImagePicker}
              onPressIn={handleCardPressIn}
              onPressOut={handleCardPressOut}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraEmoji}>📷</Text>
              </View>
            </TouchableOpacity>

            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            {/* Goal and Progress Section with Charts */}
            <View style={styles.goalSection}>
              <Text style={styles.sectionTitle}>Current Goal</Text>
              <Text style={styles.goalText}>
                {dashboardData ? getGoalText(dashboardData.goal.type, dashboardData.goal.target) : 'Loading...'}
              </Text>
              
              {/* Charts Container */}
              <View style={styles.chartsContainer}>
                {/* Progress Completion Chart */}
                <View style={styles.chartItem}>
                  <CircularProgress
                    percentage={getProgressPercentage()}
                    size={90}
                    strokeWidth={8}
                    color="#FF9800"
                    title="Complete"
                    animValue={progressAnims.progress}
                  />
                </View>

                {/* Reduction Achievement Chart */}
                <View style={styles.chartItem}>
                  <GaugeChart
                    percentage={dashboardData?.savings?.percentage || 0}
                    title="Reduction"
                    animValue={progressAnims.reduction}
                  />
                </View>
              </View>

              {/* Wave Progress Bar for Overall Achievement - Commented out to avoid duplication */}
              {/* 
              <View style={styles.waveChartContainer}>
                <WaveProgressBar
                  percentage={getProgressPercentage()}
                  title="Goal Progress"
                  animValue={progressAnims.achievement}
                />
              </View>
              */}

              {/* User-specific progress information */}
              {dashboardData?.savings && (
                <Text style={styles.savingsText}>
                  {dashboardData.savings.percentage > 0 
                    ? `${user.firstName}, you've achieved ${dashboardData.savings.percentage}% reduction!` 
                    : `${user.firstName}, start tracking to see your progress`
                  }
                </Text>
              )}
              
              {/* Debug info (remove in production) */}
              {__DEV__ && dashboardData && (
                <Text style={[styles.savingsText, { fontSize: 10, marginTop: 8 }]}>
                  Info: Goal: {dashboardData.goal.target}% | Current: {dashboardData.savings.percentage}%
                </Text>
              )}
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        )}
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ff5252',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  animatedCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  profilePhotoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cameraEmoji: {
    fontSize: 16,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  goalSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  goalText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartItem: {
    alignItems: 'center',
  },
  waveChartContainer: {
    marginBottom: 16,
  },
  // Circular Progress Styles
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  circularTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  circularTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  // Wave Progress Styles
  waveContainer: {
    marginVertical: 8,
  },
  waveTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  waveProgressContainer: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  waveProgress: {
    height: '100%',
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  waveGradient: {
    flex: 1,
    borderRadius: 10,
  },
  wavePercentage: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  // Gauge Chart Styles
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeSvg: {
    marginBottom: -10,
  },
  gaugeTextContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  gaugePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  gaugeTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  savingsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorMessage: {
    marginHorizontal: 24,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff5252',
  },
  errorMessageText: {
    fontSize: 14,
    color: '#c62828',
    textAlign: 'center',
  },
});

export default ProfileScreen;
