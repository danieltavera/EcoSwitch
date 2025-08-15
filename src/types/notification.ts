// Notification types for EcoSwitch application

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  is_read: boolean;
  created_at: string;
  sent_at: string | null;
}

export type NotificationType = 
  | 'achievement' 
  | 'reminder' 
  | 'tip' 
  | 'challenge' 
  | 'goal' 
  | 'system' 
  | 'social' 
  | 'bill_reminder' 
  | 'savings_report' 
  | 'welcome';

export interface NotificationData {
  action?: string;
  screen?: string;
  achievement?: string;
  points?: number;
  savings_percentage?: number;
  tip_category?: string;
  entries_count?: number;
  days_since_last?: number;
  badge?: string;
  [key: string]: any;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface NotificationFilters {
  type?: NotificationType;
  unread_only?: boolean;
}
