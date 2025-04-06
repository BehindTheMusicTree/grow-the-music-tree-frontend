import { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import StatusNotification from "../../components/utils/StatusNotification";

// Create context
export const NotificationContext = createContext();

/**
 * Provider component that manages app-wide status notifications
 * Allows showing loading, success, error, and other notifications
 * without blocking the UI
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Generate a unique ID for notifications
  const generateUniqueId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Show a notification
  const showNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = generateUniqueId();

      // Add notification to the list
      setNotifications((prev) => [...prev, { id, message, type, duration }]);

      // Return the notification ID so it can be dismissed manually if needed
      return id;
    },
    [generateUniqueId]
  );

  // Show a loading notification (stays until dismissed or replaced)
  const showLoading = useCallback(
    (message = "Loading...") => {
      return showNotification(message, "loading", 0);
    },
    [showNotification]
  );

  // Show a success notification (auto-dismisses)
  const showSuccess = useCallback(
    (message) => {
      return showNotification(message, "success", 3000);
    },
    [showNotification]
  );

  // Show an error notification
  const showError = useCallback(
    (message) => {
      return showNotification(message, "error", 5000);
    },
    [showNotification]
  );

  // Update an existing notification (e.g., change loading to success)
  const updateNotification = useCallback((id, updates) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, ...updates } : notification))
    );
  }, []);

  // Dismiss a specific notification
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showLoading,
        showSuccess,
        showError,
        updateNotification,
        dismissNotification,
        dismissAll,
      }}
    >
      {children}

      {/* Render all active notifications */}
      {notifications.map(({ id, message, type, duration }) => (
        <StatusNotification
          key={id}
          message={message}
          type={type}
          duration={duration}
          onDismiss={() => dismissNotification(id)}
          visible={true}
        />
      ))}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
