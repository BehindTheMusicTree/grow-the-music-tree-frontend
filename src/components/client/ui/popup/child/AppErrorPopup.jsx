"use client";

import BasePopup from "./BasePopup";
import { AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function AppErrorPopup({ title, operationErrors, className = "" }) {
  return (
    <BasePopup title={title} isDismissable={false} className={`max-w-lg ${className}`}>
      <div className="space-y-4">
        {operationErrors &&
          operationErrors.map((errorObject, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                {errorObject.name === "Error" && <AlertCircle className="w-5 h-5 text-red-500" />}
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
    </BasePopup>
  );
}

AppErrorPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  popupContentObject: PropTypes.shape({
    title: PropTypes.string.isRequired,
    operationErrors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        errors: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ).isRequired,
  }).isRequired,
  className: PropTypes.string,
};
