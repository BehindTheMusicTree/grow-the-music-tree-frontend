"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";

export interface InternalErrorPopupProps extends BasePopupProps {
  debugCode?: string;
}

export default class InternalErrorPopup extends BasePopup<InternalErrorPopupProps> {
  render(props: InternalErrorPopupProps) {
    return this.renderBase({
      ...props,
      title: "Internal Error",
      isDismissable: false,
      icon: AlertTriangle,
      children: (
        <div className="flex flex-col items-center space-y-6 py-4">
          <AlertCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />
          <div>
            <p className="text-center text-gray-600">
              Please try again. If the problem persists, contact us at{" "}
              <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </a>
            </p>
          </div>
          {props.debugCode && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Error Code: {props.debugCode}
            </div>
          )}
        </div>
      ),
    });
  }
}
