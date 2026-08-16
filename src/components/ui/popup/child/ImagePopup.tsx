"use client";

import Image from "next/image";
import { BasePopup, BasePopupProps } from "@behindthemusictree/app-kit/popup";
import { Image as ImageIcon } from "lucide-react";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type ImagePopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  imageUrl: string;
  alt?: string;
};

export default function ImagePopup({ imageUrl, alt, ...rest }: ImagePopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Image Preview"
      topOffset={BANNER_HEIGHT}
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
