"use client";

import { useCallback } from "react";
import { usePopup } from "@contexts/PopupContext";

interface Genre {
  name: string;
  uuid: string;
}

interface PopupContent {
  message: string;
  debugCode?: string;
  onClose?: () => void;
}

interface GenreDeletionPopupContent extends PopupContent {
  genre: Genre;
  onConfirm: (genre: Genre) => void;
}

interface UseGenreDeletionReturn {
  showDeletePopup: (genre: Genre) => void;
}

export function useGenreDeletion(onDelete: (genre: Genre) => void): UseGenreDeletionReturn {
  const { showPopup } = usePopup();

  const showDeletePopup = useCallback(
    (genre: Genre) => {
      showPopup("genreDeletion", {
        message: `Are you sure you want to delete the genre "${genre.name}"?`,
        genre,
        onConfirm: (genre: Genre) => {
          onDelete(genre);
        },
      } as GenreDeletionPopupContent);
    },
    [showPopup, onDelete]
  );

  return {
    showDeletePopup,
  };
}
