"use client";

import { Button } from "@behindthemusictree/ui";
import { BasePopup, BasePopupProps } from "@behindthemusictree/app-kit/popup";
import { ReactNode } from "react";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type FormPopupProps = Omit<BasePopupProps, "title" | "icon" | "isDismissable"> & {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: ReactNode;
};

export default function FormPopup({
  onSubmit,
  onCancel,
  submitText,
  cancelText,
  loading,
  children,
  ...rest
}: FormPopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Form"
      topOffset={BANNER_HEIGHT}
      isDismissable
      children={
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelText || "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : submitText || "Submit"}
            </Button>
          </div>
        </form>
      }
    />
  );
}
