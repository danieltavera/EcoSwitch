import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ChallengesNavigationProp } from '../../types/navigation';

const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation<ChallengesNavigationProp>();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  // Datos de ejemplo para los desafíos
  const challengesData = {
    available: [
      {
        id: 1,
        title: 'Reduce Standby Power',
        description: 'Unplug devices when not in use for 7 days',
        points: 50,
        difficulty: 'Easy',
        duration: '7 days',
        icon: '🔌',
        category: 'Electricity',
        participants: 1234
      },
      {
        id: 2,
        title: 'LED Light Switch',
        description: 'Replace 5 regular bulbs with LED bulbs',
        points: 100,
        difficulty: 'Medium',
        duration: '1 week',
        icon: '💡',
        category: 'Electricity',
        participants: 856
      },
      {
        id: 3,
        title: 'Water Conservation',
        description: 'Reduce shower time by 2 minutes daily',
        points: 75,
        difficulty: 'Easy',
        duration: '14 days',
        icon: '🚿',
        category: 'Water',
        participants: 2103
      }
    ],
    active: [
      {
        id: 4,
        title: 'Thermostat Challenge',
        description: 'Keep thermostat 2°F lower for heating',
        points: 80,
        difficulty: 'Medium',
        duration: '30 days',
        icon: '🌡️',
        category: 'Heating',
        progress: 60,
        daysLeft: 12
      }
    ],
    completed: [
      {
        id: 5,
        title: 'Reduce Standby Power',
        description: 'Unplugged devices when not in use',
        points: 50,
        difficulty: 'Easy',
        icon: '🔌',
        category: 'Electricity',
        completedDate: '3 days ago',
        earned: 50
      },
      {
        id: 6,
        title: 'Smart Appliance Usage',
        description: 'Used appliances during off-peak hours',
        points: 65,
        difficulty: 'Medium',
        icon: '⏰',
        category: 'Electricity',
        completedDate: '1 week ago',
        earned: 65
      }
    ]
  };

  const userStats = {
    totalPoints: 285,
    completedChallenges: 8,
    activeStreak: 12,
    rank: 'Eco Warrior'
  };

  const handleChallengePress = (challenge: any) => {
    console.log('Navigate to Challenge Details:', challenge.title);
    // TODO: navigation.navigate('ChallengeDetails', { challengeId: challenge.id });
  };

  const handleAcceptChallenge = (challengeId: number) => {
    console.log('Accept challenge:', challengeId);
    // TODO: Implement challenge acceptance logic
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#f44336';
      default: return '#666';
    }
  };

  const renderChallengeCard = (challenge: any, type: 'available' | 'active' | 'completed') => (
    <TouchableOpacity 
      key={challenge.id} 
      style={styles.challengeCard}
      onPress={() => handleChallengePress(challenge)}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeIcon}>{challenge.icon}</Text>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
        </View>
        <View style={styles.challengePoints}>
          <Text style={styles.pointsValue}>{challenge.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.challengeMeta}>
        <View style={styles.metaItem}>
          <Text style={[styles.difficultyBadge, { color: getDifficultyColor(challenge.difficulty) }]}>
            {challenge.difficulty}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>⏱️ {challenge.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>🏷️ {challenge.category}</Text>
        </View>
      </View>

      {type === 'available' && (
        <View style={styles.challengeFooter}>
          <Text style={styles.participantsText}>
            👥 {challenge.participants.toLocaleString()} participants
          </Text>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptChallenge(challenge.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {type === 'active' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Progress: {challenge.progress}%</Text>
            <Text style={styles.daysLeftText}>{challenge.daysLeft} days left</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
          </View>
        </View>
      )}

      {type === 'completed' && (
        <View style={styles.completedFooter}>
          <Text style={styles.completedText}>✅ Completed {challenge.completedDate}</Text>
          <Text style={styles.earnedText}>+{challenge.earned} points earned</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Challenges</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats Overview */}
        <LinearGradient
          colors={['#2E7D32', '#43A047', '#66BB6A']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsHeader}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankIcon}>🏆</Text>
              <Text style={styles.rankText}>{userStats.rank}</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.completedChallenges}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.activeStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active ({challengesData.active.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {challengesData[activeTab].map(challenge => 
            renderChallengeCard(challenge, activeTab)
          )}
        </View>

        {/* Empty State */}
        {challengesData[activeTab].length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No {activeTab} challenges</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'available' && 'Check back later for new challenges!'}
              {activeTab === 'active' && 'Accept a challenge to get started!'}
              {activeTab === 'completed' && 'Complete your first challenge!'}
            </Text>
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
  headerSpacer: {
    width: 40,
  },
  statsCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  challengesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  challengePoints: {
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#2E7D32',
  },
  challengeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  daysLeftText: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  completedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  earnedText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ChallengesScreen;
