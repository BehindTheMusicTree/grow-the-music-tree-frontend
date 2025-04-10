"use client";

import { createContext, useState, useContext, useCallback } from "react";
import PropTypes from "prop-types";

const PopupContext = createContext();

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
}

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState({
    isOpen: false,
    content: null,
    type: "modal", // 'modal' | 'toast' | 'confirm'
    onConfirm: null,
    onCancel: null,
  });

  const showPopup = useCallback(({ content, type = "modal", onConfirm, onCancel }) => {
    setPopup({
      isOpen: true,
      content,
      type,
      onConfirm,
      onCancel,
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (popup.onConfirm) {
      popup.onConfirm();
    }
    hidePopup();
  }, [popup.onConfirm, hidePopup]);

  const handleCancel = useCallback(() => {
    if (popup.onCancel) {
      popup.onCancel();
    }
    hidePopup();
  }, [popup.onCancel, hidePopup]);

  return (
    <PopupContext.Provider
      value={{
        showPopup,
        hidePopup,
      }}
    >
      {children}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={popup.type === "modal" ? handleCancel : undefined} />

          {/* Content */}
          <div
            className={`
            relative z-10 rounded-lg bg-white p-6 shadow-xl
            ${popup.type === "toast" ? "animate-slide-in" : ""}
          `}
          >
            {popup.content}

            {/* Actions */}
            {popup.type === "confirm" && (
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={handleCancel} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={handleConfirm} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Confirm
                </button>
              </div>
            )}

            {/* Close button for modal */}
            {popup.type === "modal" && (
              <button onClick={handleCancel} className="absolute right-2 top-2 text-gray-500 hover:text-gray-700">
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

PopupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
