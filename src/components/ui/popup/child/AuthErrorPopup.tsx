"use client";

import { AlertCircle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";

type AuthErrorPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  message: string;
  onClose: () => void;
};

export default function AuthErrorPopup({ message, onClose, ...rest }: AuthErrorPopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Sign-in error"
      isDismissable
      icon={AlertCircle}
      children={
        <div className="flex flex-col items-center space-y-6 py-4">
          <p className="text-center text-lg font-medium text-gray-800">{message}</p>
          <Button onClick={onClose} variant="secondary" className="w-full max-w-xs">
            Close
          </Button>
        </div>
      }
    />
  );
}
