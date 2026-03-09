"use client";

import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { ReactNode } from "react";

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
