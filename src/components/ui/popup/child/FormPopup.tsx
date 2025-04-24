"use client";

import { Button } from "@/components/ui/button";
import { BasePopup, BasePopupProps } from "../BasePopup";

interface FormPopupProps extends BasePopupProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default class FormPopup extends BasePopup<FormPopupProps> {
  render(props: FormPopupProps) {
    return this.renderBase({
      ...props,
      children: (
        <form onSubmit={props.onSubmit} className="space-y-4">
          {props.children}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={props.onCancel}>
              {props.cancelText || "Cancel"}
            </Button>
            <Button type="submit" disabled={props.loading}>
              {props.loading ? "Loading..." : props.submitText || "Submit"}
            </Button>
          </div>
        </form>
      ),
    });
  }
}
