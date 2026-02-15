"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export const AUTH_POPUP_TYPE = "auth";

interface PopupState {
  content: ReactNode;
  type: string | null;
}

interface HidePopupOptions {
  onlyIfType?: string;
}

interface PopupContextType {
  showPopup: (popup: ReactNode, type?: string | null) => void;
  hidePopup: (options?: HidePopupOptions) => void;
  activePopup: ReactNode | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [state, setState] = useState<PopupState>({ content: null, type: null });
  const activePopup = state.content;

  const showPopup = (popup: ReactNode, type?: string | null) => {
    setState({ content: popup, type: type ?? null });
  };

  const hidePopup = (options?: HidePopupOptions) => {
    if (options?.onlyIfType !== undefined) {
      setState((prev) =>
        prev.type === options.onlyIfType ? { content: null, type: null } : prev,
      );
    } else {
      setState({ content: null, type: null });
    }
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
