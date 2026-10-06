import { z } from "zod";

// Mirrors grow-api's grow/curation/lists.py; the registry response doesn't carry column kinds.
export const ITEM_ID_COLUMNS = new Set(["item_id", "parent_item_id", "overview_item_id", "parent_id"]);
export const ITEM_ID_PATTERN = /^(Q\d+|LOCAL:[a-z0-9-]+)$/;
export const BOOL_COLUMNS = new Set(["exclude_other_parents"]);

export const CurationListsSchema = z.array(
  z.object({
    name: z.string(),
    keyColumns: z.array(z.string()),
    columns: z.array(z.string()),
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

export function buildCurationRowSchema(list: CurationList): z.ZodType<CurationRow> {
  return z.object(
    Object.fromEntries(
      list.columns.map((column) => {
        if (BOOL_COLUMNS.has(column)) return [column, z.enum(["true", ""])];
        const value = z.string().trim().min(1, "Required");
        const required = list.keyColumns.includes(column) ? value.regex(/^[^\t]*$/, "Must not contain a tab") : value;
        return [
          column,
          ITEM_ID_COLUMNS.has(column)
            ? required.regex(ITEM_ID_PATTERN, "Must be a Wikidata QID (Q123) or a LOCAL:<slug> id")
            : required,
        ];
      }),
    ),
  ) as z.ZodType<CurationRow>;
}

export function toCurationRow(list: CurationList, row: CurationEntry["row"]): CurationRow {
  return Object.fromEntries(
    list.columns.map((column) => {
      const value = row[column];
      return [column, typeof value === "boolean" ? (value ? "true" : "") : (value ?? "")];
    }),
  );
}

export const CanonicalGenreSearchSchema = z.object({
  results: z.array(z.object({ uuid: z.string().uuid(), name: z.string(), wikidataId: z.string().nullable() })),
});
