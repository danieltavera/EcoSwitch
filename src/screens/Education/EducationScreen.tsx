import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { EducationNavigationProp } from '../../types/navigation';

const EducationScreen: React.FC = () => {
  const navigation = useNavigation<EducationNavigationProp>();
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'tips' | 'renewable'>('all');

  // Datos de ejemplo para las lecciones educativas
  const educationData = {
    userProgress: {
      lessonsCompleted: 12,
      totalPoints: 340,
      currentStreak: 5,
      rank: 'Energy Scholar'
    },
    categories: [
      { id: 'all', name: 'All', icon: '📚', count: 18 },
      { id: 'basics', name: 'Basics', icon: '⚡', count: 6 },
      { id: 'tips', name: 'Tips', icon: '💡', count: 8 },
      { id: 'renewable', name: 'Renewable', icon: '🌱', count: 4 }
    ],
    lessons: [
      {
        id: 1,
        title: 'Understanding Your Energy Bill',
        description: 'Learn how to read and interpret your monthly energy bill',
        category: 'basics',
        duration: '8 min',
        points: 25,
        difficulty: 'Beginner',
        icon: '📄',
        isCompleted: true,
        completedDate: '2 days ago'
      },
      {
        id: 2,
        title: 'LED vs Traditional Bulbs',
        description: 'Compare energy efficiency and cost savings',
        category: 'basics',
        duration: '6 min',
        points: 20,
        difficulty: 'Beginner',
        icon: '💡',
        isCompleted: true,
        completedDate: '1 week ago'
      },
      {
        id: 3,
        title: 'Smart Thermostat Benefits',
        description: 'How smart thermostats can reduce your heating costs',
        category: 'tips',
        duration: '12 min',
        points: 35,
        difficulty: 'Intermediate',
        icon: '🌡️',
        isCompleted: false,
        isNew: true
      },
      {
        id: 4,
        title: 'Solar Energy Basics',
        description: 'Introduction to solar panels and home solar systems',
        category: 'renewable',
        duration: '15 min',
        points: 40,
        difficulty: 'Intermediate',
        icon: '☀️',
        isCompleted: true,
        completedDate: '3 days ago'
      },
      {
        id: 5,
        title: 'Phantom Load Detection',
        description: 'Identify and eliminate hidden energy consumption',
        category: 'tips',
        duration: '10 min',
        points: 30,
        difficulty: 'Intermediate',
        icon: '👻',
        isCompleted: false
      },
      {
        id: 6,
        title: 'Wind Energy for Homes',
        description: 'Small-scale wind power solutions',
        category: 'renewable',
        duration: '18 min',
        points: 45,
        difficulty: 'Advanced',
        icon: '💨',
        isCompleted: false,
        isNew: true
      },
      {
        id: 7,
        title: 'Energy Efficient Appliances',
        description: 'Choosing the right appliances for maximum savings',
        category: 'tips',
        duration: '14 min',
        points: 35,
        difficulty: 'Beginner',
        icon: '🏠',
        isCompleted: false
      },
      {
        id: 8,
        title: 'Peak Hours Optimization',
        description: 'Time your energy usage to save money',
        category: 'tips',
        duration: '9 min',
        points: 25,
        difficulty: 'Beginner',
        icon: '⏰',
        isCompleted: false
      }
    ]
  };

  const handleLessonPress = (lesson: any) => {
    console.log('Navigate to Lesson Details:', lesson.title);
    // TODO: navigation.navigate('LessonDetails', { lessonId: lesson.id });
  };

  const handleStartLesson = (lessonId: number) => {
    console.log('Start lesson:', lessonId);
    // TODO: Implement lesson start logic
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#f44336';
      default: return '#666';
    }
  };

  const filteredLessons = activeCategory === 'all' 
    ? educationData.lessons 
    : educationData.lessons.filter(lesson => lesson.category === activeCategory);

  const renderLessonCard = (lesson: any) => (
    <TouchableOpacity 
      key={lesson.id} 
      style={[styles.lessonCard, lesson.isCompleted && styles.completedCard]}
      onPress={() => handleLessonPress(lesson)}
    >
      <View style={styles.lessonHeader}>
        <View style={styles.lessonIconContainer}>
          <Text style={styles.lessonIcon}>{lesson.icon}</Text>
          {lesson.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        </View>
        <View style={styles.lessonPoints}>
          <Text style={styles.pointsValue}>{lesson.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.lessonMeta}>
        <View style={styles.metaItem}>
          <Text style={[styles.difficultyBadge, { color: getDifficultyColor(lesson.difficulty) }]}>
            {lesson.difficulty}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>⏱️ {lesson.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>📖 Lesson</Text>
        </View>
      </View>

      {lesson.isCompleted ? (
        <View style={styles.completedFooter}>
          <Text style={styles.completedText}>✅ Completed {lesson.completedDate}</Text>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lessonFooter}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => handleStartLesson(lesson.id)}
          >
            <Text style={styles.startButtonText}>Start Lesson</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Education Center</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Overview */}
        <LinearGradient
          colors={['#2E7D32', '#43A047', '#66BB6A']}
          style={styles.progressCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.progressHeader}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankIcon}>🎓</Text>
              <Text style={styles.rankText}>{educationData.userProgress.rank}</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{educationData.userProgress.lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{educationData.userProgress.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{educationData.userProgress.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {educationData.categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                activeCategory === category.id && styles.activeCategoryCard
              ]}
              onPress={() => setActiveCategory(category.id as any)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                activeCategory === category.id && styles.activeCategoryName
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                activeCategory === category.id && styles.activeCategoryCount
              ]}>
                {category.count} lessons
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lessons List */}
        <Text style={styles.sectionTitle}>
          {activeCategory === 'all' ? 'All Lessons' : 
           educationData.categories.find(c => c.id === activeCategory)?.name + ' Lessons'}
        </Text>
        <View style={styles.lessonsList}>
          {filteredLessons.map(lesson => renderLessonCard(lesson))}
        </View>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No lessons found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different category or check back later for new content!
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
  progressCard: {
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
  progressHeader: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCategoryCard: {
    backgroundColor: '#2E7D32',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activeCategoryName: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 10,
    color: '#666',
  },
  activeCategoryCount: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lessonsList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  lessonCard: {
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
  completedCard: {
    backgroundColor: '#f8fffe',
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  lessonIcon: {
    fontSize: 32,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff5722',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lessonPoints: {
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
  lessonMeta: {
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
  lessonFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  reviewButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
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

export default EducationScreen;
