"use client";

import { X } from "lucide-react";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export function PopupTitle({ title, onClose, isDismissable }) {
  return (
    <div className="flex items-center justify-between">
      <h3 id="popup-title" className="text-gray-600">
        {title}
      </h3>
      {isDismissable && (
        <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8" aria-label="Close popup">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

PopupTitle.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isDismissable: PropTypes.bool,
};
