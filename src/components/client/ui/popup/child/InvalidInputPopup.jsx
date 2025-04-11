"use client";

import { BasePopup } from "./BasePopup";
import { AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

export function InvalidInputPopup({ onClose, title, operationErrors, className = "" }) {
  return (
    <BasePopup title={title} onClose={onClose} className={`max-w-md ${className}`}>
      <div className="space-y-4">
        {operationErrors.map((errorObject, index) => (
          <div key={index} className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <ul className="list-none space-y-1">
              {errorObject.errors.map((error, index) => (
                <li key={index} className="text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </BasePopup>
  );
}

InvalidInputPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  operationErrors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      errors: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};
