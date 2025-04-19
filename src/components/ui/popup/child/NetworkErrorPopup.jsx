"use client";

import BasePopup from "./BasePopup";
import PropTypes from "prop-types";
import { WifiOff, AlertTriangle } from "lucide-react";

export default function NetworkErrorPopup() {
  return (
    <BasePopup title="Network Error" isDismissable={false} icon={AlertTriangle}>
      <div className="flex flex-col items-center space-y-6 py-4">
        <WifiOff className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
        <p className="text-center text-gray-700">
          It seems that you are not connected to the internet. Please check your connection and try again.
        </p>
      </div>
    </BasePopup>
  );
}

NetworkErrorPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};
