export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

export interface NotificationPreference {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  types: string[];
}
