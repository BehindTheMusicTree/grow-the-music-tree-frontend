"use client";

import { X } from "lucide-react";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export function PopupTitle({ title, onClose, isDismissable, icon: Icon }) {
  return (
    <div className="flex items-center justify-between bg-black p-4 -m-4 mb-0 rounded-t-lg">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-white" />}
        <h3 id="popup-title" className="text-white font-semibold">
          {title}
        </h3>
      </div>
      {isDismissable && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:text-white/80"
          aria-label="Close popup"
        >
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
  icon: PropTypes.elementType,
};
