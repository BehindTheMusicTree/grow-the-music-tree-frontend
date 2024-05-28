import PropTypes from "prop-types";

export default function ApiErrorPopupChild({ popupContentObject: apiErrorPopupContentObject }) {
  return <div>{apiErrorPopupContentObject.message}</div>;
}

ApiErrorPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
