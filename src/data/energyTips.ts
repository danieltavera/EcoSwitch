export interface EnergyTip {
  id: string;
  title: string;
  content: string;
  icon: string;
  category: 'heating' | 'cooling' | 'lighting' | 'appliances' | 'water' | 'renewable' | 'general';
  priority: 'high' | 'medium' | 'low';
  
  // Filtros de personalización
  goals?: ('reduce_10' | 'reduce_20' | 'reduce_30' | 'carbon_neutral')[];
  houseTypes?: ('apartment' | 'house' | 'townhouse' | 'studio')[];
  seasons?: ('spring' | 'summer' | 'fall' | 'winter')[];
  progressLevels?: ('starting' | 'progressing' | 'achieving' | 'struggling')[];
  hasRenewableEnergy?: boolean;
  occupants?: {
    min?: number;
    max?: number;
  };
}

export const energyTips: EnergyTip[] = [
  // Tips generales para empezar
  {
    id: 'tip_001',
    title: 'Start Your Energy Journey',
    content: 'Track your daily energy usage to identify patterns and opportunities for savings.',
    icon: '🌱',
    category: 'general',
    priority: 'high',
    progressLevels: ['starting'],
  },
  {
    id: 'tip_002',
    title: 'LED Light Upgrade',
    content: 'Replace incandescent bulbs with LED lights to reduce lighting costs by up to 80%.',
    icon: '💡',
    category: 'lighting',
    priority: 'high',
    goals: ['reduce_10', 'reduce_20', 'reduce_30'],
  },
  
  // Tips para calefacción/refrigeración
  {
    id: 'tip_003',
    title: 'Optimal Temperature Settings',
    content: 'Set your thermostat to 68°F (20°C) in winter and 78°F (26°C) in summer for maximum efficiency.',
    icon: '🌡️',
    category: 'heating',
    priority: 'high',
    seasons: ['winter', 'summer'],
  },
  {
    id: 'tip_004',
    title: 'Summer Cooling Tips',
    content: 'Use fans to circulate air and raise your AC temperature by 2-3 degrees without sacrificing comfort.',
    icon: '❄️',
    category: 'cooling',
    priority: 'medium',
    seasons: ['summer'],
  },
  {
    id: 'tip_005',
    title: 'Winter Heating Efficiency',
    content: 'Close curtains at night and open them during sunny days to naturally regulate temperature.',
    icon: '🔥',
    category: 'heating',
    priority: 'medium',
    seasons: ['winter'],
  },

  // Tips para electrodomésticos
  {
    id: 'tip_006',
    title: 'Unplug Electronics',
    content: 'Unplug devices when not in use. Electronics consume energy even in standby mode.',
    icon: '🔌',
    category: 'appliances',
    priority: 'medium',
    goals: ['reduce_10', 'reduce_20', 'reduce_30'],
  },
  {
    id: 'tip_007',
    title: 'Efficient Laundry',
    content: 'Wash clothes in cold water and air dry when possible to reduce energy consumption by 90%.',
    icon: '👕',
    category: 'appliances',
    priority: 'medium',
  },
  {
    id: 'tip_008',
    title: 'Refrigerator Optimization',
    content: 'Keep your fridge between 37-40°F and freezer at 5°F. Clean coils regularly for better efficiency.',
    icon: '❄️',
    category: 'appliances',
    priority: 'medium',
  },

  // Tips para agua
  {
    id: 'tip_009',
    title: 'Shorter Showers',
    content: 'Reduce shower time by 2 minutes to save up to 150 gallons of water per month.',
    icon: '🚿',
    category: 'water',
    priority: 'medium',
    occupants: { min: 2 },
  },
  {
    id: 'tip_010',
    title: 'Fix Water Leaks',
    content: 'A dripping faucet can waste over 3,000 gallons per year. Fix leaks promptly.',
    icon: '💧',
    category: 'water',
    priority: 'high',
  },

  // Tips para energía renovable
  {
    id: 'tip_011',
    title: 'Solar Panel Maintenance',
    content: 'Keep your solar panels clean and free from debris to maintain optimal energy production.',
    icon: '☀️',
    category: 'renewable',
    priority: 'high',
    hasRenewableEnergy: true,
  },
  {
    id: 'tip_012',
    title: 'Consider Solar Energy',
    content: 'Explore solar panel options for your home to reduce reliance on grid electricity.',
    icon: '🌞',
    category: 'renewable',
    priority: 'low',
    hasRenewableEnergy: false,
    goals: ['carbon_neutral'],
  },

  // Tips específicos por tipo de vivienda
  {
    id: 'tip_013',
    title: 'Apartment Energy Savings',
    content: 'Use draft stoppers under doors and window insulation film to improve efficiency in apartments.',
    icon: '🏢',
    category: 'general',
    priority: 'medium',
    houseTypes: ['apartment', 'studio'],
  },
  {
    id: 'tip_014',
    title: 'House Insulation Check',
    content: 'Inspect and upgrade attic insulation to R-30 or higher for better temperature control.',
    icon: '🏠',
    category: 'heating',
    priority: 'high',
    houseTypes: ['house', 'townhouse'],
    seasons: ['winter', 'summer'],
  },

  // Tips según progreso
  {
    id: 'tip_015',
    title: 'You\'re Making Great Progress!',
    content: 'Your energy savings are on track. Consider adding smart home devices to optimize further.',
    icon: '🎉',
    category: 'general',
    priority: 'medium',
    progressLevels: ['achieving'],
  },
  {
    id: 'tip_016',
    title: 'Stay Motivated',
    content: 'Small changes add up! Focus on one energy-saving habit at a time for lasting results.',
    icon: '💪',
    category: 'general',
    priority: 'high',
    progressLevels: ['struggling'],
  },
  {
    id: 'tip_017',
    title: 'Keep Building Good Habits',
    content: 'You\'re developing great energy habits! Try tracking peak usage times to save even more.',
    icon: '📈',
    category: 'general',
    priority: 'medium',
    progressLevels: ['progressing'],
  },

  // Tips estacionales adicionales
  {
    id: 'tip_018',
    title: 'Spring Cleaning for Energy',
    content: 'Clean air vents and replace HVAC filters to improve air circulation and efficiency.',
    icon: '🌸',
    category: 'heating',
    priority: 'medium',
    seasons: ['spring'],
  },
  {
    id: 'tip_019',
    title: 'Fall Energy Preparation',
    content: 'Seal windows and doors with weatherstripping before winter to prevent heat loss.',
    icon: '🍂',
    category: 'heating',
    priority: 'high',
    seasons: ['fall'],
  },

  // Tips adicionales para metas específicas
  {
    id: 'tip_020',
    title: 'Carbon Neutral Goal',
    content: 'Track your carbon footprint and consider carbon offset programs for unavoidable emissions.',
    icon: '🌍',
    category: 'general',
    priority: 'high',
    goals: ['carbon_neutral'],
  },
];
