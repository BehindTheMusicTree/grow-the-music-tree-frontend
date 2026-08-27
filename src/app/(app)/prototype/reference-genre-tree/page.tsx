"use client";

import GenreTreePage from "@components/features/genre-tree/GenreTreePage";
import { getGrowPrototypeBackendBaseUrl } from "@lib/site-urls";

export default function PrototypeReferenceGenreTreePage() {
  return (
    <GenreTreePage getBackendBaseUrl={getGrowPrototypeBackendBaseUrl} title="Prototype Genre Tree (Demo)" readOnly={true} />
  );
}
