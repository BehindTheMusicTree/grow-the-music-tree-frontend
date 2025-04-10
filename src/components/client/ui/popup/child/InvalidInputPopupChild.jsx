"use client";

import PropTypes from "prop-types";

export default function InvalidInputPopupChild({ popupContentObject }) {
  return (
    <div>
      {popupContentObject.operationErrors.map((errorObject, index) => (
        <div key={index}>
          <ul className="list-none pl-4">
            {errorObject.errors.map((error, index) => (
              <li key={index} className="text-red-500">
                ❌ {error}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

InvalidInputPopupChild.propTypes = {
  popupContentObject: PropTypes.shape({
    title: PropTypes.string.isRequired,
    operationErrors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        errors: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ).isRequired,
  }).isRequired,
};
