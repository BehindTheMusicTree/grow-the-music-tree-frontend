"use client";

import BasePopup from "./BasePopup";
import PropTypes from "prop-types";

export default function NetworkErrorPopup() {
  return (
    <BasePopup title={"Network Error"} isDismissable={false}>
      <div className="space-y-4">
        <p>It seems that you are not connected to the internet. Please check your connection and try again.</p>
      </div>
    </BasePopup>
  );
}

NetworkErrorPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};
