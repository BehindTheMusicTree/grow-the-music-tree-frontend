"use client";

import { BasePopup } from "./BasePopup";
import Image from "next/image";

export function ImagePopup({ title, imageUrl, onClose, alt = "Popup image" }) {
  return (
    <BasePopup title={title} onClose={onClose} className="p-0 overflow-hidden">
      <div className="relative aspect-video">
        <Image src={imageUrl} alt={alt} fill className="object-cover" />
      </div>
    </BasePopup>
  );
}
