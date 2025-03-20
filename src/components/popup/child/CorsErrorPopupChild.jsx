import PropTypes from "prop-types";

export default function CorsErrorPopupChild({ popupContentObject }) {
  return (
    <div>
      {popupContentObject.operationErrors.map((errorObject, index) => (
        <div key={index}>
          <h3 className="font-bold text-md mb-1">{errorObject.name}</h3>
          <ul className="list-none pl-4 mb-3">
            {errorObject.errors.map((error, index) => (
              <li key={index} className={errorObject.name === "Error" ? "text-red-500" : "text-orange-500"}>
                {errorObject.name === "Error" ? "❌ " : "⚠️ "}
                {error}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

CorsErrorPopupChild.propTypes = {
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