import { EnergyTip, energyTips } from '../data/energyTips';

export interface UserContext {
  goal?: {
    type: string;
    target: number;
    hasRenewableEnergy: boolean;
  };
  household?: {
    type: string;
    occupants: number;
  };
  savings?: {
    percentage: number;
    hasComparison: boolean;
    comparisonType?: string;
  };
}

export type ProgressLevel = 'starting' | 'progressing' | 'achieving' | 'struggling';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

/**
 * Obtiene la estación actual basada en la fecha
 */
export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};

/**
 * Determina el nivel de progreso del usuario basado en sus ahorros
 */
export const getProgressLevel = (userContext: UserContext): ProgressLevel => {
  const { goal, savings } = userContext;
  
  // Si no hay meta establecida o es el primer mes
  if (!goal || goal.type === 'Not set' || !savings?.hasComparison || savings.comparisonType === 'first_month') {
    return 'starting';
  }
  
  const target = goal.target;
  const current = Math.abs(savings.percentage);
  
  // Si está ahorrando pero no alcanza la meta
  if (savings.percentage >= 0) {
    if (current >= target) {
      return 'achieving';
    } else if (current >= target * 0.5) {
      return 'progressing';
    } else {
      return 'starting';
    }
  } else {
    // Si está gastando más que antes
    return 'struggling';
  }
};

/**
 * Filtra los tips basado en el contexto del usuario
 */
export const getPersonalizedTips = (userContext: UserContext): EnergyTip[] => {
  const currentSeason = getCurrentSeason();
  const progressLevel = getProgressLevel(userContext);
  
  return energyTips.filter(tip => {
    // Filtro por meta/objetivo
    if (tip.goals && userContext.goal?.type !== 'Not set') {
      const goalType = userContext.goal?.type;
      if (goalType && !tip.goals.includes(goalType as any)) {
        return false;
      }
    }
    
    // Filtro por tipo de casa
    if (tip.houseTypes && userContext.household?.type !== 'Not set') {
      const houseType = userContext.household?.type;
      if (houseType && !tip.houseTypes.includes(houseType as any)) {
        return false;
      }
    }
    
    // Filtro por estación
    if (tip.seasons && !tip.seasons.includes(currentSeason)) {
      return false;
    }
    
    // Filtro por nivel de progreso
    if (tip.progressLevels && !tip.progressLevels.includes(progressLevel)) {
      return false;
    }
    
    // Filtro por energía renovable
    if (tip.hasRenewableEnergy !== undefined) {
      const hasRenewable = userContext.goal?.hasRenewableEnergy || false;
      if (tip.hasRenewableEnergy !== hasRenewable) {
        return false;
      }
    }
    
    // Filtro por número de ocupantes
    if (tip.occupants && userContext.household?.occupants) {
      const occupants = userContext.household.occupants;
      if (tip.occupants.min && occupants < tip.occupants.min) {
        return false;
      }
      if (tip.occupants.max && occupants > tip.occupants.max) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Obtiene tips priorizados y limitados para mostrar en el carousel
 */
export const getTipsForCarousel = (
  userContext: UserContext, 
  maxTips: number = 5
): EnergyTip[] => {
  const personalizedTips = getPersonalizedTips(userContext);
  
  // Ordenar por prioridad (high > medium > low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  const sortedTips = personalizedTips.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Si tienen la misma prioridad, ordenar por categoría (general primero para tips de progreso)
    if (a.category === 'general' && b.category !== 'general') return -1;
    if (b.category === 'general' && a.category !== 'general') return 1;
    
    return 0;
  });
  
  // Limitar el número de tips y asegurar variedad
  const selectedTips = [];
  const usedCategories = new Set<string>();
  
  // Primero agregar tips de alta prioridad
  for (const tip of sortedTips) {
    if (selectedTips.length >= maxTips) break;
    
    if (tip.priority === 'high') {
      selectedTips.push(tip);
      usedCategories.add(tip.category);
    }
  }
  
  // Luego agregar tips de otras prioridades, evitando repetir categorías si es posible
  for (const tip of sortedTips) {
    if (selectedTips.length >= maxTips) break;
    
    if (tip.priority !== 'high' && !selectedTips.includes(tip)) {
      // Preferir tips de categorías nuevas si no hemos llegado al límite
      if (selectedTips.length < maxTips - 1 || !usedCategories.has(tip.category)) {
        selectedTips.push(tip);
        usedCategories.add(tip.category);
      }
    }
  }
  
  // Si aún no tenemos suficientes tips, agregar los restantes
  for (const tip of sortedTips) {
    if (selectedTips.length >= maxTips) break;
    
    if (!selectedTips.includes(tip)) {
      selectedTips.push(tip);
    }
  }
  
  return selectedTips.slice(0, maxTips);
};

/**
 * Obtiene un tip aleatorio de la lista personalizada (para rotación)
 */
export const getRandomPersonalizedTip = (userContext: UserContext): EnergyTip | null => {
  const personalizedTips = getPersonalizedTips(userContext);
  
  if (personalizedTips.length === 0) {
    // Fallback: devolver un tip general si no hay tips personalizados
    const generalTips = energyTips.filter(tip => tip.category === 'general');
    if (generalTips.length === 0) return null;
    
    return generalTips[Math.floor(Math.random() * generalTips.length)];
  }
  
  return personalizedTips[Math.floor(Math.random() * personalizedTips.length)];
};
