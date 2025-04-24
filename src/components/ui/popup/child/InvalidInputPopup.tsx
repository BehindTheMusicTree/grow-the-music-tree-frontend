"use client";

import { MdError } from "react-icons/md";
import { BasePopup, BasePopupProps } from "../BasePopup";

interface InvalidInputPopupProps extends BasePopupProps {
  details: {
    message: string;
    fieldErrors?: Record<string, Array<{ message: string; code: string }>>;
  };
}

export default class InvalidInputPopup extends BasePopup<InvalidInputPopupProps> {
  render(props: InvalidInputPopupProps) {
    return this.renderBase({
      ...props,
      title: "Invalid Input",
      className: "max-w-md",
      children: (
        <div className="space-y-4">
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">{props.details.message}</h3>
          </div>
          {props.details.fieldErrors && (
            <div className="mt-4">
              {Object.entries(props.details.fieldErrors).map(([fieldName, errors]) => (
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
      ),
    });
  }
}
