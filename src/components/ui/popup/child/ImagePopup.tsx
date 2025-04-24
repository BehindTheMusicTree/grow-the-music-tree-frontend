"use client";

import Image from "next/image";
import { BasePopupComponent, BasePopupProps } from "../BasePopup";

interface ImagePopupProps extends BasePopupProps {
  imageUrl: string;
  alt?: string;
}

export default class ImagePopup extends BasePopupComponent<ImagePopupProps> {
  render(props: ImagePopupProps) {
    return this.renderBase({
      ...props,
      className: "p-0 overflow-hidden",
      children: (
        <div className="relative aspect-video">
          <Image src={props.imageUrl} alt={props.alt || "Popup image"} fill className="object-cover" />
        </div>
      ),
    });
  }
}
