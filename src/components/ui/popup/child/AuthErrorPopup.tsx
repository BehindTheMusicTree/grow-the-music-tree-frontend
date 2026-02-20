"use client";

import { AlertCircle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";

type AuthErrorPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  message: string;
  onClose: () => void;
};

// @ts-expect-error: omitted props are set internally by the popup
export default class AuthErrorPopup extends BasePopup<AuthErrorPopupProps> {
  render() {
    const { message, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Sign-in error",
      isDismissable: true,
      icon: AlertCircle,
      children: (
        <div className="flex flex-col items-center space-y-6 py-4">
          <p className="text-center text-lg font-medium text-gray-800">{message}</p>
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full max-w-xs"
          >
            Close
          </Button>
        </div>
      ),
    });
  }
}
