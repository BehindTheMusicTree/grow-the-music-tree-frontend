"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BasePopup, BasePopupProps } from "@/components/ui/popup/BasePopup";

interface PopupState {
  popup: typeof BasePopup;
  content: BasePopupProps;
}

interface PopupContextType {
  showPopup: (popupComponent: typeof BasePopup, content?: BasePopupProps) => void;
  hidePopup: () => void;
  activePopup: PopupState | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [activePopup, setActivePopup] = useState<PopupState | null>(null);

  const showPopup = (popup: typeof BasePopup, content: BasePopupProps) => {
    setActivePopup({ popup, content });
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
