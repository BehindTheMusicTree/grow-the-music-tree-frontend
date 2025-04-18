"use client";

import BasePopup from "./BasePopup";
import { Button } from "@components/ui/button";

export default function FormPopup({
  title,
  children,
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
}) {
  return (
    <BasePopup title={title} onClose={onCancel}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : submitText}
          </Button>
        </div>
      </form>
    </BasePopup>
  );
}
