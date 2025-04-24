"use client";

import { BasePopupComponent, BasePopupProps } from "../BasePopup";
import Button from "@/components/ui/Button";

interface GenreDeletionPopupProps extends BasePopupProps {
  genre: {
    name: string;
  };
  onConfirm: (genre: { name: string }) => void;
}

export default class GenreDeletionPopup extends BasePopupComponent<GenreDeletionPopupProps> {
  render(props: GenreDeletionPopupProps) {
    const handleConfirm = () => {
      props.onConfirm(props.genre);
      props.onClose();
    };

    return this.renderBase({
      ...props,
      title: "Delete Genre",
      children: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the genre &quot;{props.genre.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button onClick={props.onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      ),
    });
  }
}
