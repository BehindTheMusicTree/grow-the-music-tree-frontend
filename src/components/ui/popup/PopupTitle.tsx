"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LucideIcon } from "lucide-react";

interface PopupTitleProps {
  title: string;
  onClose: () => void;
  isDismissable?: boolean;
  icon?: LucideIcon;
}

export function PopupTitle({ title, onClose, isDismissable, icon: Icon }: PopupTitleProps) {
  return (
    <div className="flex items-center justify-between bg-black p-4 -m-4 mb-0 rounded-t-lg">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-white" />}
        <h3 id="popup-title" className="text-white font-semibold">
          {title}
        </h3>
      </div>
      {isDismissable && (
        <Button onClick={onClose} className="h-8 w-8 text-white hover:text-white/80" aria-label="Close popup">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
