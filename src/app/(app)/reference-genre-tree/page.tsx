"use client";

import GenreTreePage from "@components/features/genre-tree/GenreTreePage";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export default function ReferenceGenreTreePage() {
  return <GenreTreePage getBackendBaseUrl={getGrowBackendBaseUrl} title="Reference Genre Tree" readOnly={false} />;
}
