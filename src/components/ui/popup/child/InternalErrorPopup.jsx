"use client";

import BasePopup from "./BasePopup";
import { AlertTriangle, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export default function InternalErrorPopup({ operationErrors, onClose }) {
  return (
    <BasePopup title="Internal Error" isDismissable={false} icon={AlertTriangle}>
      <div className="flex flex-col items-center space-y-6 py-4">
        <AlertCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />

        <div className="space-y-4 w-full">
          {operationErrors &&
            operationErrors.map((errorObject, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{errorObject.name}</h3>
                </div>
                <ul className="list-none pl-4 space-y-2">
                  {errorObject.errors.map((error, index) => (
                    <li
                      key={index}
                      className={`${
                        errorObject.name === "Error"
                          ? "text-red-600 font-semibold"
                          : errorObject.name === "Need Help?"
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                      dangerouslySetInnerHTML={{ __html: error }}
                    />
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="text-center space-y-4 pt-2 border-t border-gray-200 w-full">
          <p className="text-gray-600">
            Please try again. If the problem persists, contact us at{" "}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
          </p>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Try Again
          </Button>
        </div>
      </div>
    </BasePopup>
  );
}

InternalErrorPopup.propTypes = {
  operationErrors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      errors: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};
