"use client";

import { BasePopup, BasePopupProps } from "../PopupContainer";
import { Button } from "@components/ui/Button";

interface GenreDeletionPopupProps extends BasePopupProps {
  genre: {
    name: string;
  };
  onConfirm: (genre: { name: string }) => void;
}

export default function GenreDeletionPopup({ genre, onConfirm, onClose, ...props }: GenreDeletionPopupProps) {
  const handleConfirm = () => {
    onConfirm(genre);
    onClose?.();
  };

  return (
    <BasePopup {...props} title="Delete Genre" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete the genre &quot;{genre.name}&quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </BasePopup>
  );
}
