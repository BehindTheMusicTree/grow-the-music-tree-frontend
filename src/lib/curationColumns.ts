const COLUMN_TITLES: Record<string, string> = {
  item_id: "Genre",
  label: "Nom (nouvel item)",
  genre_item_id: "Genre",
  reason: "Raison",
  over_item_id: "Prioritaire sur",
  parent_item_id: "Parent",
  parent_id: "Parent",
  overview_item_id: "Vue d'ensemble",
  exclude_other_parents: "Exclure les autres parents",
  word: "Mot",
  capitalized: "Forme capitalisée",
  display_label: "Libellé affiché",
  musicbrainz_genre_name: "Genre MusicBrainz",
  wikidata_genre_name: "Genre Wikidata",
  root_item_id: "Racine",
  pop_child_item_id: "Enfant pop",
};

export function curationColumnTitle(column: string): string {
  return COLUMN_TITLES[column] ?? column;
}
