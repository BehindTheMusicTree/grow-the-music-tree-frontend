"use client";

import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";
import { Trash2 } from "lucide-react";

// Only allow genre and onConfirm as custom props
type GenreDeletionPopupProps = Omit<
  BasePopupProps,
  "title" | "children" | "icon" | "isDismissable" | "contentClassName"
> & {
  genre: { name: string };
  onConfirm: (genre: { name: string }) => void;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class GenreDeletionPopup extends BasePopup<GenreDeletionPopupProps> {
  handleConfirm = () => {
    this.props.onConfirm(this.props.genre);
    this.props.onClose?.();
  };

  render() {
    const { genre, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Delete Genre",
      isDismissable: true,
      icon: Trash2,
      children: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the genre &quot;{genre.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      ),
    });
  }
}
