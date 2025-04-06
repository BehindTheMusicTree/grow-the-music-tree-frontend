import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaSpotify, FaCheckCircle, FaSpinner } from "react-icons/fa";
import PropTypes from "prop-types";

/**
 * A non-blocking notification component that shows status updates
 * Can be used to display loading, success, and error states without blocking the UI
 */
const StatusNotification = ({
  message,
  type = "info", // 'loading', 'success', 'error', 'info'
  duration = 5000, // auto-dismiss after 5 seconds for success/error, loading stays until done
  onDismiss,
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Auto-dismiss non-loading notifications after duration
  useEffect(() => {
    setIsVisible(visible);

    if (visible && type !== "loading" && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, type, duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case "loading":
        return <FaSpinner className="animate-spin text-blue-500" />;
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "spotify":
        return <FaSpotify className="text-[#1DB954]" />;
      default:
        return null;
    }
  };

  // Get background color based on notification type
  const getBgColor = () => {
    switch (type) {
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "success":
        return "bg-green-100 border-green-400 text-green-700";
      case "spotify":
        return "bg-[#1DB954] bg-opacity-10 border-[#1DB954] text-gray-800";
      case "loading":
        return "bg-blue-100 border-blue-400 text-blue-700";
      default:
        return "bg-gray-100 border-gray-400 text-gray-700";
    }
  };

  // Create portal to render at the top of the page, outside normal flow
  return createPortal(
    <div
      className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg border ${getBgColor()} 
                    flex items-center space-x-2 max-w-sm transition-all duration-300 transform`}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-grow text-sm">{message}</div>

      {/* Only show close button for non-loading notifications */}
      {type !== "loading" && (
        <button className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700" onClick={handleDismiss}>
          ×
        </button>
      )}
    </div>,
    document.body
  );
};

StatusNotification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["loading", "success", "error", "info", "spotify"]),
  duration: PropTypes.number,
  onDismiss: PropTypes.func,
  visible: PropTypes.bool,
};

export default StatusNotification;
