"use client";

import { AlertCircle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";

type InvalidInputPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  details: {
    message: string;
    fieldErrors?: Record<string, Array<{ message: string; code: string }>>;
  };
};

export default function InvalidInputPopup({ details, ...rest }: InvalidInputPopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Invalid Input"
      isDismissable
      icon={AlertCircle}
      children={
        <div className="space-y-4">
          <div className="flex items-center">
            <AlertCircle size={20} color="red" />
            <h3 className="ml-1">{details.message}</h3>
          </div>
          {details.fieldErrors && (
            <div className="mt-4">
              {Object.entries(details.fieldErrors).map(([fieldName, errors]) => (
                <div key={fieldName} className="mb-2">
                  <h4 className="font-semibold">{fieldName}</h4>
                  <ul className="ml-4">
                    {errors.map((error, index) => (
                      <li key={index} className="text-red-500">
                        - {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
