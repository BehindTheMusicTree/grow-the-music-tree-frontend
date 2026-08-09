"use client";

import { useCallback } from "react";
import { usePopup } from "@behindthemusictree/app-kit/popup";
import GenreDeletionPopup from "@components/ui/popup/child/GenreDeletionPopup";
import { useDeleteGenre } from "@behindthemusictree/app-kit/genre-tree";
import { Scope } from "@behindthemusictree/app-kit/transport";
import { getBackendBaseUrl } from "@lib/site-urls";

interface Genre {
  name: string;
  uuid: string;
}

interface UseGenreDeletionReturn {
  showDeletePopup: (genre: Genre) => void;
}

export function useGenreDeletion(scope: Scope, onDelete?: (genre: Genre) => void): UseGenreDeletionReturn {
  const { showPopup, hidePopup } = usePopup();
  const deleteGenre = useDeleteGenre(scope, getBackendBaseUrl);

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
