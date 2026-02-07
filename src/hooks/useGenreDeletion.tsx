"use client";

import { useCallback } from "react";
import { usePopup } from "@contexts/PopupContext";
import GenreDeletionPopup from "@components/ui/popup/child/GenreDeletionPopup";
import { useDeleteGenre } from "./useGenre";

interface Genre {
  name: string;
  uuid: string;
}

interface UseGenreDeletionReturn {
  showDeletePopup: (genre: Genre) => void;
}

export function useGenreDeletion(isReference: boolean, onDelete?: (genre: Genre) => void): UseGenreDeletionReturn {
  const { showPopup, hidePopup } = usePopup();
  const deleteGenre = useDeleteGenre(isReference);

  const showDeletePopup = useCallback(
    (genre: Genre) => {
      showPopup(
        <GenreDeletionPopup
          genre={genre}
          onConfirm={(genre: Genre) => {
            deleteGenre.mutate({ uuid: genre.uuid });
            hidePopup();
            onDelete?.(genre);
          }}
          onClose={hidePopup}
        />,
      );
    },
    [showPopup, hidePopup, deleteGenre, onDelete],
  );

  return {
    showDeletePopup,
  };
}
