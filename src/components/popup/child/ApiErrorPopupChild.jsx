import PropTypes from "prop-types";

export default function ApiErrorPopupChild({ popupContentObject: apiErrorPopupContentObject }) {
  return <div dangerouslySetInnerHTML={{ __html: apiErrorPopupContentObject.message }} />;
}

ApiErrorPopupChild.propTypes = {
  popupContentObject: PropTypes.object.isRequired,
};
