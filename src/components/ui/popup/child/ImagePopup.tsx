"use client";

import Image from "next/image";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Image as ImageIcon } from "lucide-react";

// Only allow imageUrl and alt as custom props
type ImagePopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  imageUrl: string;
  alt?: string;
};

// @ts-expect-error: title and icon are set internally by the popup
export default class ImagePopup extends BasePopup<ImagePopupProps> {
  render() {
    const { imageUrl, alt, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Image Preview",
      isDismissable: true,
      icon: ImageIcon,
      children: (
        <div className="relative aspect-video">
          <Image src={imageUrl} alt={alt || "Popup image"} fill className="object-cover" />
        </div>
      ),
    });
  }
}
