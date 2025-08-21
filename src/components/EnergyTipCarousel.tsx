import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Animated 
} from 'react-native';
import { EnergyTip } from '../data/energyTips';

interface EnergyTipCarouselProps {
  tips: EnergyTip[];
  autoRotateInterval?: number; // en milisegundos
  onTipPress?: (tip: EnergyTip) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 20;
const CARD_PADDING = 20;
const cardWidth = screenWidth - (CARD_MARGIN * 2); // Margen total de 40px (20px cada lado)

const EnergyTipCarousel: React.FC<EnergyTipCarouselProps> = ({
  tips,
  autoRotateInterval = 8000, // 8 segundos por defecto
  onTipPress
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-rotation effect
  useEffect(() => {
    if (tips.length <= 1) return;

    const startAutoRotation = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % tips.length;
          
          // Animación de fade durante la transición
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.7,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          
          return nextIndex;
        });
      }, autoRotateInterval);
    };

    startAutoRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tips.length, autoRotateInterval, fadeAnim]);

  // Scroll to current tip when index changes
  useEffect(() => {
    if (scrollViewRef.current && tips.length > 0) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * (cardWidth + 12), // Incluir margen entre tarjetas
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleTipPress = (tip: EnergyTip) => {
    if (onTipPress) {
      onTipPress(tip);
    }
  };

  const handleManualScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (cardWidth + 12)); // Incluir el margen entre tarjetas
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < tips.length) {
      setCurrentIndex(newIndex);
      
      // Reset auto-rotation timer when user manually scrolls
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setCurrentIndex(prevIndex => (prevIndex + 1) % tips.length);
        }, autoRotateInterval);
      }
    }
  };

  if (!tips || tips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyTitle}>No Tips Available</Text>
          <Text style={styles.emptyText}>
            Complete your home setup to get personalized energy tips
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>💡 Energy Tips for You</Text>
        {tips.length > 1 && (
          <View style={styles.indicators}>
            {tips.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleManualScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContainer}
          snapToInterval={cardWidth + 12} // Ancho de la tarjeta + margen entre tarjetas
          snapToAlignment="start"
        >
          {tips.map((tip, index) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.tipCard}
              onPress={() => handleTipPress(tip)}
              activeOpacity={0.8}
            >
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipMeta}>
                  <Text style={styles.tipCategory}>{tip.category.toUpperCase()}</Text>
                  <View style={[
                    styles.priorityBadge,
                    tip.priority === 'high' ? styles.priorityHigh :
                    tip.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow
                  ]}>
                    <Text style={styles.priorityText}>{tip.priority}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipContent}>{tip.content}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  indicators: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
  },
  inactiveIndicator: {
    backgroundColor: '#E0E0E0',
  },
  scrollContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingRight: CARD_MARGIN + 12, // Espacio extra al final
  },
  tipCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    minHeight: 160, // Altura reducida sin footer
    justifyContent: 'flex-start', // Alineación desde arriba
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 28,
    marginRight: 12,
    lineHeight: 32, // Mejor alineación vertical
  },
  tipMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tipCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'right',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityHigh: {
    backgroundColor: '#FFE5E5',
  },
  priorityMedium: {
    backgroundColor: '#FFF3E0',
  },
  priorityLow: {
    backgroundColor: '#E8F5E8',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
    flexShrink: 1, // Permite que el texto se ajuste
  },
  tipContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    textAlign: 'left', // Alineación consistente del texto
  },
  emptyState: {
    backgroundColor: '#fff',
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnergyTipCarousel;
