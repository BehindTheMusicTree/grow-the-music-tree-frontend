import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import StatusNotification from "../../components/utils/StatusNotification";
import NotificationService from "../../utils/services/NotificationService";

// Create context
export const NotificationContext = createContext();

/**
 * Provider component that manages app-wide status notifications
 * Allows showing loading, success, error, and other notifications
 * without blocking the UI
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(({ type, message, duration }) => {
      const id = `notification-${Date.now()}-${counterRef.current++}`;
      setNotifications((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    });

    return () => unsubscribe();
  }, []);

  const showNotification = ({ type, message, duration = 5000 }) => {
    NotificationService.showNotification({ type, message, duration });
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification }}>
      {children}

      {/* Render all active notifications */}
      {notifications.map(({ id, message, type, duration }) => (
        <StatusNotification
          key={id}
          message={message}
          type={type}
          duration={duration}
          onDismiss={() => showNotification({ type, message, duration: 0 })}
          visible={true}
        />
      ))}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
