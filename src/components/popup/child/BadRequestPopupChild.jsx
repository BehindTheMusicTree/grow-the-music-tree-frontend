import PropTypes from "prop-types";

export default function BadRequestErrorPopupChild() {
  // export default function BadRequestErrorPopupChild({ popupContentObject }) {
  return (
    <div>Error</div>
    // <div>
    //   {popupContentObject.operationErrors.map((errorObject, index) => (
    //     <div key={index}>
    //       <ul className="list-none pl-4">
    //         {errorObject.errors.map((error, index) => (
    //           <li key={index} className="text-red-500">
    //             ❌ {error}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   ))}
    // </div>
  );
}

BadRequestErrorPopupChild.propTypes = {
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
