"use client";

import { BasePopup, BasePopupProps } from "@behindthemusictree/app-kit/popup";
import { Button } from "@behindthemusictree/ui";
import { Trash2 } from "lucide-react";
import { BANNER_HEIGHT } from "@lib/constants/layout";

interface Genre {
  name: string;
  uuid: string;
}

type GenreDeletionPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  genre: Genre;
  onConfirm: (genre: Genre) => void;
};

export default function GenreDeletionPopup({ genre, onConfirm, onClose, ...rest }: GenreDeletionPopupProps) {
  const handleConfirm = () => {
    onConfirm(genre);
    onClose?.();
  };

  return (
    <BasePopup
      {...rest}
      onClose={onClose}
      title="Delete Genre"
      topOffset={BANNER_HEIGHT}
      isDismissable
      icon={Trash2}
      children={
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
      }
    />
  );
}
