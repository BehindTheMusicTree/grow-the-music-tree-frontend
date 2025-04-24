"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BasePopupComponent, BasePopupProps } from "@/components/ui/popup/BasePopup";
import {
  FormPopup,
  InvalidInputPopup,
  InternalErrorPopup,
  NetworkErrorPopup,
  GenreDeletionPopup,
  SpotifyAuthPopup,
  SpotifyAuthErrorPopup,
  UploadedTrackEditionPopup,
  ImagePopup,
} from "@/components/ui/popup/child";

type PopupComponent = BasePopupComponent;

interface PopupState {
  type: PopupComponent;
  content: BasePopupProps;
}

interface PopupContextType {
  showPopup: (type: PopupComponent, content: BasePopupProps) => void;
  hidePopup: () => void;
  activePopup: PopupState | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [activePopup, setActivePopup] = useState<PopupState | null>(null);

  const showPopup = (type: PopupComponent, content: BasePopupProps) => {
    setActivePopup({ type, content });
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
