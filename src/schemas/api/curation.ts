import { z } from "zod";

// Mirrors app-kit's GenreUuidSchema: its genre-tree entry is client-only, and this module is also used server-side.
const GenreUuidSchema = z.string().uuid().brand<"GenreUuid">();

export const ITEM_ID_PATTERN = /^(Q\d+|LOCAL:[a-z0-9-]+)$/;
const TRADITION_ID_PATTERN = /^Q\d+$/;
const ENTITY_ID_PATTERN = /^([a-z]{4}[0-9]{4}|Q\d+)$/;
const INT_PATTERN = /^-?\d+$/;

const PATTERN_KINDS = {
  item_id: { pattern: ITEM_ID_PATTERN, message: "Must be a Wikidata QID (Q123) or a LOCAL:<slug> id" },
  tradition_id: { pattern: TRADITION_ID_PATTERN, message: "Must be a Wikidata QID (Q123)" },
  entity_id: { pattern: ENTITY_ID_PATTERN, message: "Must be a Glottocode (abcd1234) or a Wikidata QID (Q123)" },
  int: { pattern: INT_PATTERN, message: "Must be a whole number" },
} as const;

export const CurationColumnSpecSchema = z.object({
  name: z.string(),
  kind: z.enum(["item_id", "tradition_id", "entity_id", "int", "bool", "text"]),
  optional: z.boolean(),
});

export type CurationColumnSpec = z.infer<typeof CurationColumnSpecSchema>;

export const CurationListsSchema = z.array(
  z.object({
    name: z.string(),
    keyColumns: z.array(z.string()),
    columns: z.array(z.string()),
    columnSpecs: z.array(CurationColumnSpecSchema),
    description: z.string(),
    count: z.number(),
  }),
);

export type CurationList = z.infer<typeof CurationListsSchema>[number];

export const CurationEntrySchema = z.object({
  uuid: z.string().uuid(),
  row: z.record(z.union([z.string(), z.boolean()])),
  createdOn: z.string(),
  updatedOn: z.string().nullable(),
});

export type CurationEntry = z.infer<typeof CurationEntrySchema>;

// Not app-kit's PaginatedResponseSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
export const CurationEntriesPageSchema = z.object({
  overallTotal: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(CurationEntrySchema),
  labels: z.record(z.string()),
});

export type CurationEntriesPage = z.infer<typeof CurationEntriesPageSchema>;

export const CurationRulesSchema = z.object({
  results: z.array(CurationEntrySchema.extend({ listName: z.string() })),
  labels: z.record(z.string()),
});

export type CurationRules = z.infer<typeof CurationRulesSchema>;

export const CurationHistoryPageSchema = z.object({
  overallTotal: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(
    z.object({
      uuid: z.string().uuid(),
      action: z.enum(["created", "updated", "deleted"]),
      /** Null when the pipeline made the edit. */
      actorPseudo: z.string().nullable(),
      /** JSON snapshots of `{list_name, ...row}`. */
      oldValue: z.string().nullable(),
      newValue: z.string().nullable(),
      createdOn: z.string(),
      entry: z.string().uuid(),
    }),
  ),
  labels: z.record(z.string()),
});

export type CurationHistoryPage = z.infer<typeof CurationHistoryPageSchema>;
export type CurationHistoryItem = CurationHistoryPage["results"][number];

/** A history snapshot's row; `list_name` sits next to the columns. */
export const CurationSnapshotSchema = z.record(z.union([z.string(), z.boolean(), z.null()]));

export const CurationStatusSchema = z.object({
  /** When the pipeline last applied an export to the canonical tree; null before its first run. */
  appliedExportOn: z.string().nullable(),
  pendingCount: z.number(),
});

export type CurationStatus = z.infer<typeof CurationStatusSchema>;

export const CURATION_ORDERINGS = ["key", "-updated_on"] as const;
export type CurationOrdering = (typeof CURATION_ORDERINGS)[number];

export type CurationRow = Record<string, string>;

function buildColumnSchema({ kind, optional }: CurationColumnSpec, isKey: boolean) {
  if (kind === "bool") return z.enum(["true", ""]);
  const value = z.string().trim();
  const filled = optional ? value : value.min(1, "Required");
  const keyed = isKey ? filled.regex(/^[^\t]*$/, "Must not contain a tab") : filled;
  if (kind === "text") return keyed;
  const { pattern, message } = PATTERN_KINDS[kind];
  return optional
    ? keyed.refine((entry) => entry === "" || pattern.test(entry), message)
    : keyed.regex(pattern, message);
}

export function buildCurationRowSchema(list: CurationList): z.ZodType<CurationRow> {
  return z.object(
    Object.fromEntries(
      list.columnSpecs.map((spec) => [spec.name, buildColumnSchema(spec, list.keyColumns.includes(spec.name))]),
    ),
  ) as z.ZodType<CurationRow>;
}

/** The column kind of `column` in `list`, text when unknown. */
export function curationColumnKind(list: CurationList, column: string): CurationColumnSpec["kind"] {
  return list.columnSpecs.find((spec) => spec.name === column)?.kind ?? "text";
}

export function toCurationRow(list: CurationList, row: CurationEntry["row"]): CurationRow {
  return Object.fromEntries(
    list.columns.map((column) => {
      const value = row[column];
      return [column, typeof value === "boolean" ? (value ? "true" : "") : (value ?? "")];
    }),
  );
}

export const CurationItemSearchSchema = z.object({
  results: z.array(z.object({ id: z.string(), label: z.string() })),
});

export const CanonicalGenreSearchSchema = z.object({
  results: z.array(
    z.object({
      uuid: GenreUuidSchema,
      name: z.string(),
      wikidataId: z.string().nullable(),
      isUmbrella: z.boolean().optional(),
    }),
  ),
  page: z.number().int(),
  totalPages: z.number().int(),
});

export const CurationReviewReasonSchema = z.enum(["redirect_conflict", "missing", "not_in_tree"]);

export type CurationReviewReason = z.infer<typeof CurationReviewReasonSchema>;

const EvidenceItemSchema = z.object({ id: z.string(), label: z.string().nullable() });

export const CurationReviewEvidenceSchema = z.object({
  label: z.string().optional(),
  modified: z.string().optional(),
  instanceOf: z.array(EvidenceItemSchema).optional(),
  subclassOf: z.array(EvidenceItemSchema).optional(),
  hasIndigenousTo: z.boolean().optional(),
  conflictList: z.string().optional(),
});

export type CurationReviewEvidence = z.infer<typeof CurationReviewEvidenceSchema>;

export const CurationReviewItemsSchema = z.array(
  z.object({
    list: z.string(),
    key: z.string(),
    column: z.string(),
    itemId: z.string(),
    reason: CurationReviewReasonSchema,
    target: z.string().nullable(),
    reportedOn: z.string(),
    evidence: CurationReviewEvidenceSchema.nullish(),
  }),
);

export type CurationReviewItem = z.infer<typeof CurationReviewItemsSchema>[number];

const UuidOutputSchema = z.object({ uuid: z.string() });

export const AssignSongGenreInputSchema = z.object({
  songs: z.array(z.string()).min(1),
  genre: z.string().nullable(),
});
export type AssignSongGenreInput = z.infer<typeof AssignSongGenreInputSchema>;

export const AssignSongGenreOutputSchema = z.object({
  previous: z.array(z.object({ uuid: z.string(), genre: z.string().nullable(), undoable: z.boolean() })),
});
export type AssignSongGenreOutput = z.infer<typeof AssignSongGenreOutputSchema>;

const VideoSchema = z.object({
  youtubeVideoId: z.string().max(32).nullable(),
  youtubeUnplayableReason: z.string().nullable(),
});
export type SongVideo = z.infer<typeof VideoSchema>;

export const UpdateSongVideoInputSchema = z.object({
  uuid: z.string(),
  video: VideoSchema,
  previous: VideoSchema,
});
export type UpdateSongVideoInput = z.infer<typeof UpdateSongVideoInputSchema>;

export const SongVideoDetailSchema = z.object({
  uuid: z.string(),
  youtubeVideoId: z.string().nullable().optional(),
  youtubeUnplayableReason: z.string().nullable().optional(),
});

export const SecondaryParentInputSchema = z.object({
  uuid: GenreUuidSchema,
  parent: z.object({ uuid: GenreUuidSchema, name: z.string() }),
  add: z.boolean(),
});
export type SecondaryParentInput = z.infer<typeof SecondaryParentInputSchema>;
export const SecondaryParentOutputSchema = UuidOutputSchema;

export const GenreTreeRowsSchema = z.array(
  z.object({
    criteria: z
      .object({
        uuid: GenreUuidSchema,
        secondaryParents: z.array(z.object({ uuid: GenreUuidSchema, name: z.string() })),
      })
      .nullable(),
  }),
);

export const AliasGenreInputSchema = z.object({ uuid: z.string(), target: z.string() });
export type AliasGenreInput = z.infer<typeof AliasGenreInputSchema>;
export const AliasGenreOutputSchema = UuidOutputSchema;
export const AliasPreviewSchema = z.object({
  songs: z.number(),
  essentialSongs: z.number(),
  children: z.number(),
});

// Mirrors grow-api's EXCLUDED_GENRE_LISTS keys.
export const EXCLUDE_CATEGORIES = {
  theme: "Theme",
  technique: "Technique",
  out_of_scope: "Out of scope",
  duplicate: "Duplicate",
} as const;
export type ExcludeCategory = keyof typeof EXCLUDE_CATEGORIES;
export const ExcludeGenreInputSchema = z.object({
  uuid: z.string(),
  category: z.enum(["theme", "technique", "out_of_scope", "duplicate"]),
});
export type ExcludeGenreInput = z.infer<typeof ExcludeGenreInputSchema>;
export const ExcludeGenreOutputSchema = UuidOutputSchema;

export const UpdateGenreSummaryInputSchema = z.object({
  uuid: GenreUuidSchema,
  summary: z.string().nullable(),
  previous: z.string().nullable(),
});
export type UpdateGenreSummaryInput = z.infer<typeof UpdateGenreSummaryInputSchema>;
export const UpdateGenreNameInputSchema = z.object({ uuid: GenreUuidSchema, name: z.string(), previous: z.string() });
export type UpdateGenreNameInput = z.infer<typeof UpdateGenreNameInputSchema>;
const ParentSchema = z.object({ uuid: GenreUuidSchema, name: z.string() });
export const UpdateGenreParentInputSchema = z.object({
  uuid: GenreUuidSchema,
  parent: ParentSchema,
  previous: ParentSchema.nullable(),
});
export type UpdateGenreParentInput = z.infer<typeof UpdateGenreParentInputSchema>;
export const UpdateGenreOutputSchema = UuidOutputSchema;

const EssentialSongSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  artists: z.array(z.object({ uuid: z.string(), name: z.string() })).nullish(),
});
export type EssentialSong = z.infer<typeof EssentialSongSchema>;
export const UpdateEssentialSongsInputSchema = z.object({
  uuid: GenreUuidSchema,
  tracks: z.array(EssentialSongSchema),
  previous: z.array(EssentialSongSchema),
});
export type UpdateEssentialSongsInput = z.infer<typeof UpdateEssentialSongsInputSchema>;

export const LinkCandidateSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  artists: z.array(z.object({ uuid: z.string(), name: z.string() })).nullish(),
  genre: z.object({ uuid: z.string(), name: z.string() }).nullish(),
});
export type LinkCandidate = z.infer<typeof LinkCandidateSchema>;
export const LinkSuggestionsSchema = z.array(LinkCandidateSchema);
export const SongSearchSchema = z.object({
  results: z.array(LinkCandidateSchema),
  next: z.string().nullable(),
});
