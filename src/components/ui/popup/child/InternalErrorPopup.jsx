"use client";

import BasePopup from "./BasePopup";
import { AlertTriangle, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function InternalErrorPopup({ debugCode }) {
  return (
    <BasePopup title="Internal Error" isDismissable={false} icon={AlertTriangle}>
      <div className="flex flex-col items-center space-y-6 py-4">
        <AlertCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />

        <div>
          <p className="text-gray-600">
            Please try again. If the problem persists, contact us at{" "}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
          </p>
        </div>

        {debugCode && (
          <div className="text-sm text-center text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
            Error Code: {debugCode}
          </div>
        )}
      </div>
    </BasePopup>
  );
}

InternalErrorPopup.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  debugCode: PropTypes.string,
};
