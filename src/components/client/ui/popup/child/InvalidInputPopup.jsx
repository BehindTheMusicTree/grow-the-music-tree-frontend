"use client";

import PropTypes from "prop-types";
import { MdError } from "react-icons/md";

export default function InvalidInputPopup({ content, onClose }) {
  const { details } = content;

  return (
    <div>
      <div className="flex items-center">
        <MdError size={20} color="red" />
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
  );
}

InvalidInputPopup.propTypes = {
  content: PropTypes.shape({
    details: PropTypes.shape({
      message: PropTypes.string.isRequired,
      fieldErrors: PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            message: PropTypes.string.isRequired,
            code: PropTypes.string.isRequired,
          })
        )
      ),
    }).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
