"use client";

import PropTypes from "prop-types";

export default function ConnectivityErrorPopupChild({ popupContentObject }) {
  return (
    <div className="space-y-4">
      {popupContentObject.operationErrors.map((errorObject, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
          <h3 className="font-bold text-lg mb-2 text-gray-800">{errorObject.name}</h3>
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
  );
}

ConnectivityErrorPopupChild.propTypes = {
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
