const COLUMN_TITLES: Record<string, string> = {
  item_id: "Genre",
  item_label: "Nom du genre",
  reason: "Raison",
  parent_item_id: "Parent",
  parent_id: "Parent",
  parent_label: "Nom du parent",
  overview_item_id: "Vue d'ensemble",
  exclude_other_parents: "Exclure les autres parents",
  word: "Mot",
  capitalized: "Forme capitalisée",
  display_label: "Libellé affiché",
  musicbrainz_genre_name: "Genre MusicBrainz",
  wikidata_genre_name: "Genre Wikidata",
  root_genre_name: "Racine",
  pop_child_genre_name: "Enfant pop",
};

/** Name columns that only restate an item id column's genre, keyed by that id column. */
export const PAIRED_LABEL_COLUMNS: Record<string, string> = { item_id: "item_label", parent_id: "parent_label" };

const PAIRED_LABELS = new Set(Object.values(PAIRED_LABEL_COLUMNS));

export function curationColumnTitle(column: string): string {
  return COLUMN_TITLES[column] ?? column;
}

/** Columns worth a table cell: a paired name column is shown through its id column's genre. */
export function displayedCurationColumns(columns: string[]): string[] {
  return columns.filter((column) => !PAIRED_LABELS.has(column));
}
