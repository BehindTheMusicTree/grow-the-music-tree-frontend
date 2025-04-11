"use client";

import React, { useState } from "react";
import { GenreDeletionPopup } from "../components/client/ui/popup/child/GenreDeletionPopup";

export function useGenreDeletion(onDelete) {
  const [genreToDelete, setGenreToDelete] = useState(null);

  const showDeletePopup = (genre) => {
    setGenreToDelete(genre);
  };

  const handleDelete = (genre) => {
    onDelete(genre);
    setGenreToDelete(null);
  };

  const DeletePopup = () => {
    if (!genreToDelete) return null;

    return <GenreDeletionPopup genre={genreToDelete} onClose={() => setGenreToDelete(null)} onConfirm={handleDelete} />;
  };

  return {
    showDeletePopup,
    DeletePopup,
  };
}
