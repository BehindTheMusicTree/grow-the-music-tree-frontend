import { useContext } from 'react';
import { PopupContext } from './PopupContext'

export function usePopup() {
  return useContext(PopupContext);
}