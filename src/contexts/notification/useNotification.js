import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

/**
 * Custom hook for accessing the notification context
 * Provides methods for showing various types of notifications
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};