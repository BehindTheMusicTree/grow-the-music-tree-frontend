"use client";

import { useCallback } from "react";
import { usePopup } from "@/contexts/PopupContext";

export function useGenreDeletion(onDelete) {
  const { showPopup } = usePopup();

  const showDeletePopup = useCallback(
    (genre) => {
      showPopup("genreDeletion", {
        genre,
        onConfirm: (genre) => {
          onDelete(genre);
        },
      });
    },
    [showPopup, onDelete]
  );

  return {
    showDeletePopup,
  };
}
