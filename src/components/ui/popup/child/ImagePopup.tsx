"use client";

import Image from "next/image";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Image as ImageIcon } from "lucide-react";

type ImagePopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  imageUrl: string;
  alt?: string;
};

export default function ImagePopup({ imageUrl, alt, ...rest }: ImagePopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Image Preview"
      isDismissable
      icon={ImageIcon}
      children={
        <div className="relative aspect-video">
          <Image src={imageUrl} alt={alt || "Popup image"} fill className="object-cover" />
        </div>
      }
    />
  );
}
