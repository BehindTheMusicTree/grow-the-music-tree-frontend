"use client";

import { createContext, useContext, useCallback } from "react";
import { usePopup } from "./PopupContext";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const { showPopup } = usePopup();

  const handleError = useCallback(
    (error) => {
      // Handle authentication errors
      if (error?.name === "AuthenticationError" || error?.message === "Unauthorized" || error?.status === 401) {
        showPopup("spotifyAuth", {
          message: "Connect your Spotify account to access all features",
          onAuthenticate: () => {
            // This will be handled by the popup component
          },
        });
        return;
      }

      // Handle fetch errors
      if (error?.response) {
        showPopup("error", {
          message: `Request failed with status ${error.response.status}`,
        });
        return;
      }

      // Handle generic errors
      showPopup("error", {
        message: error?.message || "An unexpected error occurred",
      });
    },
    [showPopup]
  );

  return <ErrorContext.Provider value={{ handleError }}>{children}</ErrorContext.Provider>;
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
