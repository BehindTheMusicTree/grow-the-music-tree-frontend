"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PopupContextType {
  showPopup: (popup: ReactNode) => void;
  hidePopup: () => void;
  activePopup: ReactNode | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [activePopup, setActivePopup] = useState<ReactNode | null>(null);

  const showPopup = (popup: ReactNode) => {
    setActivePopup(popup);
  };

  const hidePopup = () => {
    setActivePopup(null);
  };

  return <PopupContext.Provider value={{ showPopup, hidePopup, activePopup }}>{children}</PopupContext.Provider>;
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
}
