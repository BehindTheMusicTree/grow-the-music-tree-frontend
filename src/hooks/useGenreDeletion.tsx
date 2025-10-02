"use client";

import { useCallback } from "react";
import { usePopup } from "@contexts/PopupContext";
import GenreDeletionPopup from "@components/ui/popup/child/GenreDeletionPopup";

interface Genre {
  name: string;
  uuid: string;
}

interface UseGenreDeletionReturn {
  showDeletePopup: (genre: Genre) => void;
}

export function useGenreDeletion(onDelete: (genre: Genre) => void): UseGenreDeletionReturn {
  const { showPopup, hidePopup } = usePopup();

  const showDeletePopup = useCallback(
    (genre: Genre) => {
      showPopup(
        <GenreDeletionPopup
          genre={genre}
          onConfirm={(genre: Genre) => {
            onDelete(genre);
            hidePopup();
          }}
        />
      );
    },
    [showPopup, hidePopup, onDelete]
  );

  return {
    showDeletePopup,
  };
}
