import { z } from "zod";

export const ImportKindSchema = z.enum(["canonical_tree", "regional_tree", "songs", "unresolved_genre_tags"]);

export type ImportKind = z.infer<typeof ImportKindSchema>;

export const IMPORT_KIND_LABELS: Record<ImportKind, string> = {
  canonical_tree: "Canonical tree",
  regional_tree: "Regional tree",
  songs: "Songs",
  unresolved_genre_tags: "Unresolved genre tags",
};

export const ImportRunSchema = z.object({
  kind: ImportKindSchema,
  importedOn: z.string(),
  count: z.number(),
  skippedCount: z.number().nullable(),
});

export type ImportRun = z.infer<typeof ImportRunSchema>;

/** Keyed by camelCased kind; a kind never imported is null. */
export const LatestImportRunsSchema = z.object({
  canonicalTree: ImportRunSchema.nullable(),
  regionalTree: ImportRunSchema.nullable(),
  songs: ImportRunSchema.nullable(),
  unresolvedGenreTags: ImportRunSchema.nullable(),
});

export type LatestImportRuns = z.infer<typeof LatestImportRunsSchema>;

// Not app-kit's PaginatedResponseSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
export const ImportRunsPageSchema = z.object({
  overallTotal: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(ImportRunSchema),
});

export type ImportRunsPage = z.infer<typeof ImportRunsPageSchema>;
