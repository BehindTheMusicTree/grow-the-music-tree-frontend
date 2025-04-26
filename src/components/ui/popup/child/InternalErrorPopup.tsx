"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

type InternalErrorPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  errorCode: ErrorCode;
};

// @ts-expect-error: title, children, icon, isDismissable are set internally by the popup
export default class InternalErrorPopup extends BasePopup<InternalErrorPopupProps> {
  render() {
    const { errorCode, ...rest } = this.props;
    return this.renderBase({
      ...rest,
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
          {errorCode && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Error Code: {errorCode}
            </div>
          )}
        </div>
      ),
    });
  }
}
